import type {
	IIdentifier, CredentialPayload, VerifiableCredential,
} from '@veramo/core'
import { MemoryPrivateKeyStore } from '@veramo/key-manager'
import { KeyManagementSystem } from '@veramo/kms-local'
import { CheqdDIDProvider, ResourcePayload } from '@cheqd/did-provider-cheqd'
import type {
	BulkRevocationResult, BulkSuspensionResult, BulkUnsuspensionResult, CreateStatusList2021Result,
} from '@cheqd/did-provider-cheqd/build/types/agent/ICheqd'
import { CheqdNetwork } from '@cheqd/sdk'

import {
	BroadCastStatusListOptions, CreateStatusListOptions, CredentialRequest, DefaultRPCUrl,
	StatusOptions, UpdateStatusListOptions,
} from '../../types/shared.js'
import { Connection } from '../../database/connection/connection.js'
import { Veramo } from './agent.js'
import { DefaultIdentity } from './default.js'

import * as dotenv from 'dotenv'
dotenv.config()

const {
	MAINNET_RPC_URL,
	TESTNET_RPC_URL,
	DEFAULT_FEE_PAYER_MNEMONIC,
	ISSUER_PUBLIC_KEY_HEX,
	ISSUER_PRIVATE_KEY_HEX,
	ISSUER_DID
} = process.env

export class LocalIdentity extends DefaultIdentity {
	initAgent() {
		if (!DEFAULT_FEE_PAYER_MNEMONIC) {
			throw new Error(`No fee payer found`)
		}
		if (this.agent) {
			return this.agent
		}
		const dbConnection = Connection.instance.dbConnection

		const mainnetProvider = new CheqdDIDProvider(
			{
				defaultKms: 'local',
				cosmosPayerSeed: DEFAULT_FEE_PAYER_MNEMONIC,
				networkType: CheqdNetwork.Mainnet,
				rpcUrl: MAINNET_RPC_URL || DefaultRPCUrl.Mainnet,
			}
		)
		const testnetProvider = new CheqdDIDProvider(
			{
				defaultKms: 'local',
				cosmosPayerSeed: DEFAULT_FEE_PAYER_MNEMONIC,
				networkType: CheqdNetwork.Testnet,
				rpcUrl: TESTNET_RPC_URL || DefaultRPCUrl.Testnet,
			}
		)
		this.agent = Veramo.instance.createVeramoAgent({
			dbConnection,
			kms: {
				local: new KeyManagementSystem(
					new MemoryPrivateKeyStore()
				)
			},
			providers: {
				'did:cheqd:mainnet': mainnetProvider,
				'did:cheqd:testnet': testnetProvider
			},
			cheqdProviders: [mainnetProvider, testnetProvider],
			enableCredential: true,
			enableResolver: true
		})
		return this.agent
	}

	async getKey(kid: string) {
		return Veramo.instance.getKey(this.initAgent(), kid)
	}

	async deactivateDid(did: string): Promise<boolean> {
		try {
			return await Veramo.instance.deactivateDid(this.initAgent(), did)
		} catch (error) {
			throw new Error(`${error}`)
		}
	}

	async listDids() {
		return [(await this.importDid()).did]
	}

	async getDid(did: string) {
		return Veramo.instance.getDid(this.initAgent(), did)
	}

	async importDid(): Promise<IIdentifier> {
		if (!(ISSUER_DID && ISSUER_PUBLIC_KEY_HEX && ISSUER_PRIVATE_KEY_HEX)) throw new Error('No DIDs and Keys found')
		try {
			return await this.getDid(ISSUER_DID)
		} catch {
			const identifier: IIdentifier = await Veramo.instance.importDid(this.initAgent(), ISSUER_DID, ISSUER_PRIVATE_KEY_HEX, ISSUER_PUBLIC_KEY_HEX)
			return identifier
		}
	}

	async createResource(network: string, payload: ResourcePayload) {
		try {
			await this.importDid()
			return await Veramo.instance.createResource(this.initAgent(), network, payload)
		} catch (error) {
			throw new Error(`${error}`)
		}
	}

	async createCredential(credential: CredentialPayload, format: CredentialRequest['format'], statusListOptions: StatusOptions | null): Promise<VerifiableCredential> {
		try {
			await this.importDid()
			return await Veramo.instance.createCredential(this.initAgent(), credential, format, statusListOptions)
		} catch (error) {
			throw new Error(`${error}`)
		}
	}

	async createStatusList2021(did: string, resourceOptions: ResourcePayload, statusListOptions: CreateStatusListOptions): Promise<CreateStatusList2021Result> {
		return await Veramo.instance.createStatusList2021(this.initAgent(), did, resourceOptions, statusListOptions)
	}

	async updateStatusList2021(did: string, statusOptions: UpdateStatusListOptions, publish: boolean): Promise<BulkRevocationResult | BulkSuspensionResult | BulkUnsuspensionResult> {
		return await Veramo.instance.updateStatusList2021(this.initAgent(), did, statusOptions, publish)
	}

	async broadcastStatusList2021(did: string, resourceOptions: ResourcePayload, statusOptions: BroadCastStatusListOptions): Promise<boolean> {
		return await Veramo.instance.broadcastStatusList2021(this.initAgent(), did, resourceOptions, statusOptions)
	}

	async revokeCredentials(credentials: VerifiableCredential | VerifiableCredential[], publish: boolean) {
		return await Veramo.instance.revokeCredentials(this.initAgent(), credentials, publish)
	}

	async suspendCredentials(credentials: VerifiableCredential | VerifiableCredential[], publish: boolean) {
		return await Veramo.instance.suspendCredentials(this.initAgent(), credentials, publish)
	}

	async reinstateCredentials(credentials: VerifiableCredential | VerifiableCredential[], publish: boolean) {
		return await Veramo.instance.unsuspendCredentials(this.initAgent(), credentials, publish)
	}
}
