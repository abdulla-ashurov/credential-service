import {
	createAgent,
	CredentialPayload,
	DIDDocument,
	IAgentPlugin,
	ICreateVerifiableCredentialArgs,
	IDIDManager,
	IIdentifier,
	IKeyManager,
	IResolver,
	IVerifyResult,
	ManagedKeyInfo,
	MinimalImportableIdentifier,
	MinimalImportableKey,
	TAgent,
	VerifiableCredential,
	VerifiablePresentation,
} from '@veramo/core';
import { KeyManager } from '@veramo/key-manager';
import { DIDStore, KeyStore } from '@veramo/data-store';
import { DIDManager } from '@veramo/did-manager';
import { DIDResolverPlugin, getUniversalResolver as UniversalResolver } from '@veramo/did-resolver';
import { getResolver as VeridaResolver } from '@verida/vda-did-resolver';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { CredentialIssuerLD, LdDefaultContexts, VeramoEd25519Signature2018 } from '@veramo/credential-ld';
import {
	Cheqd,
	getResolver as CheqdDidResolver,
	DefaultResolverUrl,
	type ResourcePayload,
	type ICheqdBroadcastStatusList2021Args,
	type ICheqdCheckCredentialStatusWithStatusList2021Args,
	type ICheqdCreateStatusList2021Args,
	type ICheqdDeactivateIdentifierArgs,
	type ICheqdRevokeBulkCredentialsWithStatusList2021Args,
	type ICheqdUpdateIdentifierArgs,
	type ICheqdVerifyCredentialWithStatusList2021Args,
	type ICheqdVerifyPresentationWithStatusList2021Args,
} from '@cheqd/did-provider-cheqd';
import type { CheqdNetwork } from '@cheqd/sdk';
import { getDidKeyResolver as KeyDidResolver } from '@veramo/did-provider-key';
import { Resolver, ResolverRegistry } from 'did-resolver';

import {
	BroadCastStatusListOptions,
	CheckStatusListOptions,
	cheqdDidRegex,
	CreateAgentRequest,
	CreateStatusListOptions,
	CredentialRequest,
	RevocationStatusOptions,
	StatusOptions,
	SuspensionStatusOptions,
	UpdateStatusListOptions,
	VeramoAgent,
	VerificationOptions,
} from '../../types/shared.js';
import { VC_PROOF_FORMAT, VC_REMOVE_ORIGINAL_FIELDS } from '../../types/constants.js';

export class Veramo {
	static instance = new Veramo();

	public createVeramoAgent({
		providers,
		kms,
		dbConnection,
		cheqdProviders,
		enableResolver,
		enableCredential,
	}: CreateAgentRequest): VeramoAgent {
		const plugins: IAgentPlugin[] = [];

		if (providers) {
			plugins.push(
				new DIDManager({
					store: new DIDStore(dbConnection),
					defaultProvider: 'did:cheqd:testnet',
					providers,
				})
			);
		}

		if (kms) {
			plugins.push(
				new KeyManager({
					store: new KeyStore(dbConnection),
					kms,
				})
			);
		}

		if (cheqdProviders) {
			plugins.push(
				new Cheqd({
					providers: cheqdProviders,
				})
			);
		}

		if (enableResolver) {
			plugins.push(
				new DIDResolverPlugin({
					resolver: new Resolver({
						...(CheqdDidResolver({ url: process.env.RESOLVER_URL }) as ResolverRegistry),
						...KeyDidResolver(),
						...VeridaResolver(),
						...UniversalResolver(),
					}),
				})
			);
		}

		if (enableCredential) {
			plugins.push(
				new CredentialPlugin(),
				new CredentialIssuerLD({
					contextMaps: [LdDefaultContexts],
					suites: [new VeramoEd25519Signature2018()],
				})
			);
		}
		return createAgent({ plugins });
	}

	async createKey(agent: TAgent<IKeyManager>, type: 'Ed25519' | 'Secp256k1' = 'Ed25519'): Promise<ManagedKeyInfo> {
		const [kms] = await agent.keyManagerGetKeyManagementSystems();
		const key = await agent.keyManagerCreate({
			type: type || 'Ed25519',
			kms,
		});
		return key;
	}

	async getKey(agent: TAgent<IKeyManager>, kid: string) {
		return await agent.keyManagerGet({ kid });
	}

	async createDid(agent: TAgent<IDIDManager>, network: string, didDocument: DIDDocument): Promise<IIdentifier> {
		try {
			const [kms] = await agent.keyManagerGetKeyManagementSystems();

			const identifier: IIdentifier = await agent.didManagerCreate({
				provider: `did:cheqd:${network}`,
				kms,
				options: {
					document: didDocument,
				},
			});
			return identifier;
		} catch (error) {
			throw new Error(`${error}`);
		}
	}

	async updateDid(agent: VeramoAgent, didDocument: DIDDocument): Promise<IIdentifier> {
		try {
			const [kms] = await agent.keyManagerGetKeyManagementSystems();

			const result = await agent.cheqdUpdateIdentifier({
				kms,
				document: didDocument,
			} satisfies ICheqdUpdateIdentifierArgs);
			return { ...result, provider: 'cheqd' };
		} catch (error) {
			throw new Error(`${error}`);
		}
	}

	async deactivateDid(agent: VeramoAgent, did: string): Promise<boolean> {
		try {
			const [kms] = await agent.keyManagerGetKeyManagementSystems();
			const didDocument = (await this.resolveDid(agent, did)).didDocument;

			if (!didDocument) {
				throw new Error('DID document not found');
			}
			const result = await agent.cheqdDeactivateIdentifier({
				kms,
				document: didDocument,
			} satisfies ICheqdDeactivateIdentifierArgs);
			return result;
		} catch (error) {
			throw new Error(`${error}`);
		}
	}

	async listDids(agent: TAgent<IDIDManager>) {
		return (await agent.didManagerFind()).map((res) => res.did);
	}

	async resolveDid(agent: TAgent<IResolver>, did: string) {
		return await agent.resolveDid({ didUrl: did });
	}

	async getDid(agent: TAgent<IDIDManager>, did: string) {
		return await agent.didManagerGet({ did });
	}

	async importDid(
		agent: TAgent<IDIDManager>,
		did: string,
		privateKeyHex: string,
		publicKeyHex: string
	): Promise<IIdentifier> {
		const [kms] = await agent.keyManagerGetKeyManagementSystems();

		if (!did.match(cheqdDidRegex)) {
			throw new Error('Invalid DID');
		}

		const key: MinimalImportableKey = { kms: kms, type: 'Ed25519', privateKeyHex, publicKeyHex };
		const identifier: IIdentifier = await agent.didManagerImport({
			keys: [key],
			did,
			controllerKeyId: key.kid,
		} as MinimalImportableIdentifier);
		return identifier;
	}

	async createResource(agent: VeramoAgent, network: string, payload: ResourcePayload) {
		try {
			const [kms] = await agent.keyManagerGetKeyManagementSystems();

			const result: boolean = await agent.cheqdCreateLinkedResource({
				kms,
				payload,
				network: network as CheqdNetwork,
			});
			return result;
		} catch (error) {
			throw new Error(`${error}`);
		}
	}

	async createCredential(
		agent: VeramoAgent,
		credential: CredentialPayload,
		format: CredentialRequest['format'],
		statusListOptions: StatusOptions | null
	): Promise<VerifiableCredential> {
		const issuanceOptions: ICreateVerifiableCredentialArgs = {
			save: false,
			credential,
			proofFormat: format == 'jsonld' ? 'lds' : VC_PROOF_FORMAT,
			removeOriginalFields: VC_REMOVE_ORIGINAL_FIELDS,
		};
		try {
			let verifiable_credential: VerifiableCredential;
			if (statusListOptions) {
				verifiable_credential =
					statusListOptions.statusPurpose == 'revocation'
						? await agent.cheqdIssueRevocableCredentialWithStatusList2021({
								issuanceOptions,
								statusOptions: statusListOptions as RevocationStatusOptions,
						  })
						: await agent.cheqdIssueSuspendableCredentialWithStatusList2021({
								issuanceOptions,
								statusOptions: statusListOptions as SuspensionStatusOptions,
						  });
			} else {
				verifiable_credential = await agent.createVerifiableCredential(issuanceOptions);
			}
			return verifiable_credential;
		} catch (error) {
			throw new Error(`${error}`);
		}
	}

	async verifyCredential(
		agent: VeramoAgent,
		credential: string | VerifiableCredential,
		verificationOptions: VerificationOptions = {}
	): Promise<IVerifyResult> {
		let result: IVerifyResult;
		if (verificationOptions.verifyStatus) {
			result = await agent.cheqdVerifyCredential({
				credential: credential as VerifiableCredential,
				fetchList: true,
				verificationArgs: {
					...verificationOptions,
				},
			} as ICheqdVerifyCredentialWithStatusList2021Args);
		} else {
			result = await agent.verifyCredential({
				credential,
				...verificationOptions,
				policies: {
					...verificationOptions.policies,
					credentialStatus: false,
				},
			});
		}

		if (result.didResolutionResult) {
			delete result.didResolutionResult;
		}

		if (result.jwt) {
			delete result.jwt;
		}

		if (result.verifiableCredential) {
			delete result.verifiableCredential;
		}

		if (result.payload) {
			delete result.payload;
		}

		return result;
	}

	async verifyPresentation(
		agent: VeramoAgent,
		presentation: VerifiablePresentation | string,
		verificationOptions: VerificationOptions = {}
	): Promise<IVerifyResult> {
		let result: IVerifyResult;
		if (verificationOptions.verifyStatus) {
			result = await agent.cheqdVerifyPresentation({
				presentation: presentation as VerifiablePresentation,
				fetchList: true,
				verificationArgs: {
					...verificationOptions,
				},
			} as ICheqdVerifyPresentationWithStatusList2021Args);
		} else {
			result = await agent.verifyPresentation({
				presentation,
				...verificationOptions,
				policies: {
					...verificationOptions.policies,
					credentialStatus: false,
				},
			});
		}

		if (result.didResolutionResult) {
			delete result.didResolutionResult;
		}

		if (result.jwt) {
			delete result.jwt;
		}

		if (result.verifiablePresentation) {
			delete result.verifiablePresentation;
		}

		if (result.payload) {
			delete result.payload;
		}

		return result;
	}

	async createStatusList2021(
		agent: VeramoAgent,
		did: string,
		resourceOptions: ResourcePayload,
		statusOptions: CreateStatusListOptions
	) {
		const [kms] = await agent.keyManagerGetKeyManagementSystems();

		if (!resourceOptions.name) {
			throw new Error(`StatusList name is required`);
		}
		return await agent.cheqdCreateStatusList2021({
			kms,
			issuerDid: did,
			statusListName: resourceOptions.name,
			statusPurpose: statusOptions.statusPurpose || 'revocation',
			statusListEncoding: statusOptions.encoding || 'base64url',
			statusListLength: statusOptions.length,
			encrypted: statusOptions.encrypted || false,
			resourceVersion: resourceOptions.version,
		} satisfies ICheqdCreateStatusList2021Args);
	}

	async broadcastStatusList2021(
		agent: VeramoAgent,
		did: string,
		resourceOptions: ResourcePayload,
		statusOptions: BroadCastStatusListOptions
	) {
		const [kms] = await agent.keyManagerGetKeyManagementSystems();

		if (!resourceOptions.data) {
			throw new Error(`StatusList data is required`);
		}

		return await agent.cheqdBroadcastStatusList2021({
			kms,
			payload: {
				...resourceOptions,
				collectionId: did.split(':')[3],
				data: resourceOptions.data,
				resourceType:
					statusOptions.statusPurpose === 'revocation'
						? 'StatusList2021Revocation'
						: 'StatusList2021Suspension',
			},
			network: did.split(':')[2] as CheqdNetwork,
		} satisfies ICheqdBroadcastStatusList2021Args);
	}

	async revokeCredentials(
		agent: VeramoAgent,
		credentials: VerifiableCredential | VerifiableCredential[],
		publish = true
	) {
		if (Array.isArray(credentials))
			return await agent.cheqdRevokeCredentials({
				credentials,
				fetchList: true,
				publish: true,
			} satisfies ICheqdRevokeBulkCredentialsWithStatusList2021Args);
		return await agent.cheqdRevokeCredential({ credential: credentials, fetchList: true, publish });
	}

	async resolve(didUrl: string) {
		const result = await fetch((process.env.RESOLVER_URL || DefaultResolverUrl) + didUrl, {
			headers: { 'Content-Type': 'application/did+ld+json' },
		});
		const ddo = await result.json();
		return ddo;
	}

	async suspendCredentials(
		agent: VeramoAgent,
		credentials: VerifiableCredential | VerifiableCredential[],
		publish = true
	) {
		if (Array.isArray(credentials))
			return await agent.cheqdSuspendCredentials({ credentials, fetchList: true, publish });
		return await agent.cheqdSuspendCredential({ credential: credentials, fetchList: true, publish });
	}

	async unsuspendCredentials(
		agent: VeramoAgent,
		credentials: VerifiableCredential | VerifiableCredential[],
		publish = true
	) {
		if (Array.isArray(credentials))
			return await agent.cheqdUnsuspendCredentials({ credentials, fetchList: true, publish });
		return await agent.cheqdUnsuspendCredential({ credential: credentials, fetchList: true, publish });
	}

	async updateStatusList2021(
		agent: VeramoAgent,
		did: string,
		statusOptions: UpdateStatusListOptions,
		publish = true
	) {
		switch (statusOptions.statusAction) {
			case 'revoke':
				return await agent.cheqdRevokeCredentials({
					revocationOptions: {
						issuerDid: did,
						statusListIndices: statusOptions.indices,
						statusListName: statusOptions.statusListName,
						statusListVersion: statusOptions.statusListVersion,
					},
					fetchList: true,
					publish,
					returnUpdatedStatusList: !publish,
				});
			case 'suspend':
				return await agent.cheqdSuspendCredentials({
					suspensionOptions: {
						issuerDid: did,
						statusListIndices: statusOptions.indices,
						statusListName: statusOptions.statusListName,
						statusListVersion: statusOptions.statusListVersion,
					},
					fetchList: true,
					publish,
					returnUpdatedStatusList: !publish,
				});
			case 'reinstate':
				return await agent.cheqdUnsuspendCredentials({
					unsuspensionOptions: {
						issuerDid: did,
						statusListIndices: statusOptions.indices,
						statusListName: statusOptions.statusListName,
						statusListVersion: statusOptions.statusListVersion,
					},
					fetchList: true,
					publish,
					returnUpdatedStatusList: !publish,
				});
		}
	}

	async checkStatusList2021(agent: VeramoAgent, did: string, statusOptions: CheckStatusListOptions) {
		return await agent.cheqdCheckCredentialStatus({
			statusOptions: {
				issuerDid: did,
				...statusOptions,
			},
			fetchList: true,
		} satisfies ICheqdCheckCredentialStatusWithStatusList2021Args);
	}
}
