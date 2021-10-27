// package: dapr.proto.runtime.v1
// file: dapr/proto/runtime/v1/dapr.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as google_protobuf_any_pb from "google-protobuf/google/protobuf/any_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";
import * as dapr_proto_common_v1_common_pb from "../../../../dapr/proto/common/v1/common_pb";

export class InvokeServiceRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): InvokeServiceRequest;

    hasMessage(): boolean;
    clearMessage(): void;
    getMessage(): dapr_proto_common_v1_common_pb.InvokeRequest | undefined;
    setMessage(value?: dapr_proto_common_v1_common_pb.InvokeRequest): InvokeServiceRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): InvokeServiceRequest.AsObject;
    static toObject(includeInstance: boolean, msg: InvokeServiceRequest): InvokeServiceRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: InvokeServiceRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): InvokeServiceRequest;
    static deserializeBinaryFromReader(message: InvokeServiceRequest, reader: jspb.BinaryReader): InvokeServiceRequest;
}

export namespace InvokeServiceRequest {
    export type AsObject = {
        id: string,
        message?: dapr_proto_common_v1_common_pb.InvokeRequest.AsObject,
    }
}

export class GetStateRequest extends jspb.Message { 
    getStoreName(): string;
    setStoreName(value: string): GetStateRequest;
    getKey(): string;
    setKey(value: string): GetStateRequest;
    getConsistency(): dapr_proto_common_v1_common_pb.StateOptions.StateConsistency;
    setConsistency(value: dapr_proto_common_v1_common_pb.StateOptions.StateConsistency): GetStateRequest;

    getMetadataMap(): jspb.Map<string, string>;
    clearMetadataMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetStateRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetStateRequest): GetStateRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetStateRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetStateRequest;
    static deserializeBinaryFromReader(message: GetStateRequest, reader: jspb.BinaryReader): GetStateRequest;
}

export namespace GetStateRequest {
    export type AsObject = {
        storeName: string,
        key: string,
        consistency: dapr_proto_common_v1_common_pb.StateOptions.StateConsistency,

        metadataMap: Array<[string, string]>,
    }
}

export class GetBulkStateRequest extends jspb.Message { 
    getStoreName(): string;
    setStoreName(value: string): GetBulkStateRequest;
    clearKeysList(): void;
    getKeysList(): Array<string>;
    setKeysList(value: Array<string>): GetBulkStateRequest;
    addKeys(value: string, index?: number): string;
    getParallelism(): number;
    setParallelism(value: number): GetBulkStateRequest;

    getMetadataMap(): jspb.Map<string, string>;
    clearMetadataMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetBulkStateRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetBulkStateRequest): GetBulkStateRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetBulkStateRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetBulkStateRequest;
    static deserializeBinaryFromReader(message: GetBulkStateRequest, reader: jspb.BinaryReader): GetBulkStateRequest;
}

export namespace GetBulkStateRequest {
    export type AsObject = {
        storeName: string,
        keysList: Array<string>,
        parallelism: number,

        metadataMap: Array<[string, string]>,
    }
}

export class GetBulkStateResponse extends jspb.Message { 
    clearItemsList(): void;
    getItemsList(): Array<BulkStateItem>;
    setItemsList(value: Array<BulkStateItem>): GetBulkStateResponse;
    addItems(value?: BulkStateItem, index?: number): BulkStateItem;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetBulkStateResponse.AsObject;
    static toObject(includeInstance: boolean, msg: GetBulkStateResponse): GetBulkStateResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetBulkStateResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetBulkStateResponse;
    static deserializeBinaryFromReader(message: GetBulkStateResponse, reader: jspb.BinaryReader): GetBulkStateResponse;
}

export namespace GetBulkStateResponse {
    export type AsObject = {
        itemsList: Array<BulkStateItem.AsObject>,
    }
}

export class BulkStateItem extends jspb.Message { 
    getKey(): string;
    setKey(value: string): BulkStateItem;
    getData(): Uint8Array | string;
    getData_asU8(): Uint8Array;
    getData_asB64(): string;
    setData(value: Uint8Array | string): BulkStateItem;
    getEtag(): string;
    setEtag(value: string): BulkStateItem;
    getError(): string;
    setError(value: string): BulkStateItem;

    getMetadataMap(): jspb.Map<string, string>;
    clearMetadataMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BulkStateItem.AsObject;
    static toObject(includeInstance: boolean, msg: BulkStateItem): BulkStateItem.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BulkStateItem, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BulkStateItem;
    static deserializeBinaryFromReader(message: BulkStateItem, reader: jspb.BinaryReader): BulkStateItem;
}

export namespace BulkStateItem {
    export type AsObject = {
        key: string,
        data: Uint8Array | string,
        etag: string,
        error: string,

        metadataMap: Array<[string, string]>,
    }
}

export class GetStateResponse extends jspb.Message { 
    getData(): Uint8Array | string;
    getData_asU8(): Uint8Array;
    getData_asB64(): string;
    setData(value: Uint8Array | string): GetStateResponse;
    getEtag(): string;
    setEtag(value: string): GetStateResponse;

    getMetadataMap(): jspb.Map<string, string>;
    clearMetadataMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetStateResponse.AsObject;
    static toObject(includeInstance: boolean, msg: GetStateResponse): GetStateResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetStateResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetStateResponse;
    static deserializeBinaryFromReader(message: GetStateResponse, reader: jspb.BinaryReader): GetStateResponse;
}

export namespace GetStateResponse {
    export type AsObject = {
        data: Uint8Array | string,
        etag: string,

        metadataMap: Array<[string, string]>,
    }
}

export class DeleteStateRequest extends jspb.Message { 
    getStoreName(): string;
    setStoreName(value: string): DeleteStateRequest;
    getKey(): string;
    setKey(value: string): DeleteStateRequest;

    hasEtag(): boolean;
    clearEtag(): void;
    getEtag(): dapr_proto_common_v1_common_pb.Etag | undefined;
    setEtag(value?: dapr_proto_common_v1_common_pb.Etag): DeleteStateRequest;

    hasOptions(): boolean;
    clearOptions(): void;
    getOptions(): dapr_proto_common_v1_common_pb.StateOptions | undefined;
    setOptions(value?: dapr_proto_common_v1_common_pb.StateOptions): DeleteStateRequest;

    getMetadataMap(): jspb.Map<string, string>;
    clearMetadataMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeleteStateRequest.AsObject;
    static toObject(includeInstance: boolean, msg: DeleteStateRequest): DeleteStateRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeleteStateRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeleteStateRequest;
    static deserializeBinaryFromReader(message: DeleteStateRequest, reader: jspb.BinaryReader): DeleteStateRequest;
}

export namespace DeleteStateRequest {
    export type AsObject = {
        storeName: string,
        key: string,
        etag?: dapr_proto_common_v1_common_pb.Etag.AsObject,
        options?: dapr_proto_common_v1_common_pb.StateOptions.AsObject,

        metadataMap: Array<[string, string]>,
    }
}

export class DeleteBulkStateRequest extends jspb.Message { 
    getStoreName(): string;
    setStoreName(value: string): DeleteBulkStateRequest;
    clearStatesList(): void;
    getStatesList(): Array<dapr_proto_common_v1_common_pb.StateItem>;
    setStatesList(value: Array<dapr_proto_common_v1_common_pb.StateItem>): DeleteBulkStateRequest;
    addStates(value?: dapr_proto_common_v1_common_pb.StateItem, index?: number): dapr_proto_common_v1_common_pb.StateItem;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeleteBulkStateRequest.AsObject;
    static toObject(includeInstance: boolean, msg: DeleteBulkStateRequest): DeleteBulkStateRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeleteBulkStateRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeleteBulkStateRequest;
    static deserializeBinaryFromReader(message: DeleteBulkStateRequest, reader: jspb.BinaryReader): DeleteBulkStateRequest;
}

export namespace DeleteBulkStateRequest {
    export type AsObject = {
        storeName: string,
        statesList: Array<dapr_proto_common_v1_common_pb.StateItem.AsObject>,
    }
}

export class SaveStateRequest extends jspb.Message { 
    getStoreName(): string;
    setStoreName(value: string): SaveStateRequest;
    clearStatesList(): void;
    getStatesList(): Array<dapr_proto_common_v1_common_pb.StateItem>;
    setStatesList(value: Array<dapr_proto_common_v1_common_pb.StateItem>): SaveStateRequest;
    addStates(value?: dapr_proto_common_v1_common_pb.StateItem, index?: number): dapr_proto_common_v1_common_pb.StateItem;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SaveStateRequest.AsObject;
    static toObject(includeInstance: boolean, msg: SaveStateRequest): SaveStateRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SaveStateRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SaveStateRequest;
    static deserializeBinaryFromReader(message: SaveStateRequest, reader: jspb.BinaryReader): SaveStateRequest;
}

export namespace SaveStateRequest {
    export type AsObject = {
        storeName: string,
        statesList: Array<dapr_proto_common_v1_common_pb.StateItem.AsObject>,
    }
}

export class PublishEventRequest extends jspb.Message { 
    getPubsubName(): string;
    setPubsubName(value: string): PublishEventRequest;
    getTopic(): string;
    setTopic(value: string): PublishEventRequest;
    getData(): Uint8Array | string;
    getData_asU8(): Uint8Array;
    getData_asB64(): string;
    setData(value: Uint8Array | string): PublishEventRequest;
    getDataContentType(): string;
    setDataContentType(value: string): PublishEventRequest;

    getMetadataMap(): jspb.Map<string, string>;
    clearMetadataMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PublishEventRequest.AsObject;
    static toObject(includeInstance: boolean, msg: PublishEventRequest): PublishEventRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PublishEventRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PublishEventRequest;
    static deserializeBinaryFromReader(message: PublishEventRequest, reader: jspb.BinaryReader): PublishEventRequest;
}

export namespace PublishEventRequest {
    export type AsObject = {
        pubsubName: string,
        topic: string,
        data: Uint8Array | string,
        dataContentType: string,

        metadataMap: Array<[string, string]>,
    }
}

export class InvokeBindingRequest extends jspb.Message { 
    getName(): string;
    setName(value: string): InvokeBindingRequest;
    getData(): Uint8Array | string;
    getData_asU8(): Uint8Array;
    getData_asB64(): string;
    setData(value: Uint8Array | string): InvokeBindingRequest;

    getMetadataMap(): jspb.Map<string, string>;
    clearMetadataMap(): void;
    getOperation(): string;
    setOperation(value: string): InvokeBindingRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): InvokeBindingRequest.AsObject;
    static toObject(includeInstance: boolean, msg: InvokeBindingRequest): InvokeBindingRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: InvokeBindingRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): InvokeBindingRequest;
    static deserializeBinaryFromReader(message: InvokeBindingRequest, reader: jspb.BinaryReader): InvokeBindingRequest;
}

export namespace InvokeBindingRequest {
    export type AsObject = {
        name: string,
        data: Uint8Array | string,

        metadataMap: Array<[string, string]>,
        operation: string,
    }
}

export class InvokeBindingResponse extends jspb.Message { 
    getData(): Uint8Array | string;
    getData_asU8(): Uint8Array;
    getData_asB64(): string;
    setData(value: Uint8Array | string): InvokeBindingResponse;

    getMetadataMap(): jspb.Map<string, string>;
    clearMetadataMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): InvokeBindingResponse.AsObject;
    static toObject(includeInstance: boolean, msg: InvokeBindingResponse): InvokeBindingResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: InvokeBindingResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): InvokeBindingResponse;
    static deserializeBinaryFromReader(message: InvokeBindingResponse, reader: jspb.BinaryReader): InvokeBindingResponse;
}

export namespace InvokeBindingResponse {
    export type AsObject = {
        data: Uint8Array | string,

        metadataMap: Array<[string, string]>,
    }
}

export class GetSecretRequest extends jspb.Message { 
    getStoreName(): string;
    setStoreName(value: string): GetSecretRequest;
    getKey(): string;
    setKey(value: string): GetSecretRequest;

    getMetadataMap(): jspb.Map<string, string>;
    clearMetadataMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetSecretRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetSecretRequest): GetSecretRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetSecretRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetSecretRequest;
    static deserializeBinaryFromReader(message: GetSecretRequest, reader: jspb.BinaryReader): GetSecretRequest;
}

export namespace GetSecretRequest {
    export type AsObject = {
        storeName: string,
        key: string,

        metadataMap: Array<[string, string]>,
    }
}

export class GetSecretResponse extends jspb.Message { 

    getDataMap(): jspb.Map<string, string>;
    clearDataMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetSecretResponse.AsObject;
    static toObject(includeInstance: boolean, msg: GetSecretResponse): GetSecretResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetSecretResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetSecretResponse;
    static deserializeBinaryFromReader(message: GetSecretResponse, reader: jspb.BinaryReader): GetSecretResponse;
}

export namespace GetSecretResponse {
    export type AsObject = {

        dataMap: Array<[string, string]>,
    }
}

export class GetBulkSecretRequest extends jspb.Message { 
    getStoreName(): string;
    setStoreName(value: string): GetBulkSecretRequest;

    getMetadataMap(): jspb.Map<string, string>;
    clearMetadataMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetBulkSecretRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetBulkSecretRequest): GetBulkSecretRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetBulkSecretRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetBulkSecretRequest;
    static deserializeBinaryFromReader(message: GetBulkSecretRequest, reader: jspb.BinaryReader): GetBulkSecretRequest;
}

export namespace GetBulkSecretRequest {
    export type AsObject = {
        storeName: string,

        metadataMap: Array<[string, string]>,
    }
}

export class SecretResponse extends jspb.Message { 

    getSecretsMap(): jspb.Map<string, string>;
    clearSecretsMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SecretResponse.AsObject;
    static toObject(includeInstance: boolean, msg: SecretResponse): SecretResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SecretResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SecretResponse;
    static deserializeBinaryFromReader(message: SecretResponse, reader: jspb.BinaryReader): SecretResponse;
}

export namespace SecretResponse {
    export type AsObject = {

        secretsMap: Array<[string, string]>,
    }
}

export class GetBulkSecretResponse extends jspb.Message { 

    getDataMap(): jspb.Map<string, SecretResponse>;
    clearDataMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetBulkSecretResponse.AsObject;
    static toObject(includeInstance: boolean, msg: GetBulkSecretResponse): GetBulkSecretResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetBulkSecretResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetBulkSecretResponse;
    static deserializeBinaryFromReader(message: GetBulkSecretResponse, reader: jspb.BinaryReader): GetBulkSecretResponse;
}

export namespace GetBulkSecretResponse {
    export type AsObject = {

        dataMap: Array<[string, SecretResponse.AsObject]>,
    }
}

export class TransactionalStateOperation extends jspb.Message { 
    getOperationtype(): string;
    setOperationtype(value: string): TransactionalStateOperation;

    hasRequest(): boolean;
    clearRequest(): void;
    getRequest(): dapr_proto_common_v1_common_pb.StateItem | undefined;
    setRequest(value?: dapr_proto_common_v1_common_pb.StateItem): TransactionalStateOperation;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TransactionalStateOperation.AsObject;
    static toObject(includeInstance: boolean, msg: TransactionalStateOperation): TransactionalStateOperation.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TransactionalStateOperation, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TransactionalStateOperation;
    static deserializeBinaryFromReader(message: TransactionalStateOperation, reader: jspb.BinaryReader): TransactionalStateOperation;
}

export namespace TransactionalStateOperation {
    export type AsObject = {
        operationtype: string,
        request?: dapr_proto_common_v1_common_pb.StateItem.AsObject,
    }
}

export class ExecuteStateTransactionRequest extends jspb.Message { 
    getStorename(): string;
    setStorename(value: string): ExecuteStateTransactionRequest;
    clearOperationsList(): void;
    getOperationsList(): Array<TransactionalStateOperation>;
    setOperationsList(value: Array<TransactionalStateOperation>): ExecuteStateTransactionRequest;
    addOperations(value?: TransactionalStateOperation, index?: number): TransactionalStateOperation;

    getMetadataMap(): jspb.Map<string, string>;
    clearMetadataMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ExecuteStateTransactionRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ExecuteStateTransactionRequest): ExecuteStateTransactionRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ExecuteStateTransactionRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ExecuteStateTransactionRequest;
    static deserializeBinaryFromReader(message: ExecuteStateTransactionRequest, reader: jspb.BinaryReader): ExecuteStateTransactionRequest;
}

export namespace ExecuteStateTransactionRequest {
    export type AsObject = {
        storename: string,
        operationsList: Array<TransactionalStateOperation.AsObject>,

        metadataMap: Array<[string, string]>,
    }
}

export class RegisterActorTimerRequest extends jspb.Message { 
    getActorType(): string;
    setActorType(value: string): RegisterActorTimerRequest;
    getActorId(): string;
    setActorId(value: string): RegisterActorTimerRequest;
    getName(): string;
    setName(value: string): RegisterActorTimerRequest;
    getDueTime(): string;
    setDueTime(value: string): RegisterActorTimerRequest;
    getPeriod(): string;
    setPeriod(value: string): RegisterActorTimerRequest;
    getCallback(): string;
    setCallback(value: string): RegisterActorTimerRequest;
    getData(): Uint8Array | string;
    getData_asU8(): Uint8Array;
    getData_asB64(): string;
    setData(value: Uint8Array | string): RegisterActorTimerRequest;
    getTtl(): string;
    setTtl(value: string): RegisterActorTimerRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RegisterActorTimerRequest.AsObject;
    static toObject(includeInstance: boolean, msg: RegisterActorTimerRequest): RegisterActorTimerRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RegisterActorTimerRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RegisterActorTimerRequest;
    static deserializeBinaryFromReader(message: RegisterActorTimerRequest, reader: jspb.BinaryReader): RegisterActorTimerRequest;
}

export namespace RegisterActorTimerRequest {
    export type AsObject = {
        actorType: string,
        actorId: string,
        name: string,
        dueTime: string,
        period: string,
        callback: string,
        data: Uint8Array | string,
        ttl: string,
    }
}

export class UnregisterActorTimerRequest extends jspb.Message { 
    getActorType(): string;
    setActorType(value: string): UnregisterActorTimerRequest;
    getActorId(): string;
    setActorId(value: string): UnregisterActorTimerRequest;
    getName(): string;
    setName(value: string): UnregisterActorTimerRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UnregisterActorTimerRequest.AsObject;
    static toObject(includeInstance: boolean, msg: UnregisterActorTimerRequest): UnregisterActorTimerRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UnregisterActorTimerRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UnregisterActorTimerRequest;
    static deserializeBinaryFromReader(message: UnregisterActorTimerRequest, reader: jspb.BinaryReader): UnregisterActorTimerRequest;
}

export namespace UnregisterActorTimerRequest {
    export type AsObject = {
        actorType: string,
        actorId: string,
        name: string,
    }
}

export class RegisterActorReminderRequest extends jspb.Message { 
    getActorType(): string;
    setActorType(value: string): RegisterActorReminderRequest;
    getActorId(): string;
    setActorId(value: string): RegisterActorReminderRequest;
    getName(): string;
    setName(value: string): RegisterActorReminderRequest;
    getDueTime(): string;
    setDueTime(value: string): RegisterActorReminderRequest;
    getPeriod(): string;
    setPeriod(value: string): RegisterActorReminderRequest;
    getData(): Uint8Array | string;
    getData_asU8(): Uint8Array;
    getData_asB64(): string;
    setData(value: Uint8Array | string): RegisterActorReminderRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RegisterActorReminderRequest.AsObject;
    static toObject(includeInstance: boolean, msg: RegisterActorReminderRequest): RegisterActorReminderRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RegisterActorReminderRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RegisterActorReminderRequest;
    static deserializeBinaryFromReader(message: RegisterActorReminderRequest, reader: jspb.BinaryReader): RegisterActorReminderRequest;
}

export namespace RegisterActorReminderRequest {
    export type AsObject = {
        actorType: string,
        actorId: string,
        name: string,
        dueTime: string,
        period: string,
        data: Uint8Array | string,
    }
}

export class UnregisterActorReminderRequest extends jspb.Message { 
    getActorType(): string;
    setActorType(value: string): UnregisterActorReminderRequest;
    getActorId(): string;
    setActorId(value: string): UnregisterActorReminderRequest;
    getName(): string;
    setName(value: string): UnregisterActorReminderRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UnregisterActorReminderRequest.AsObject;
    static toObject(includeInstance: boolean, msg: UnregisterActorReminderRequest): UnregisterActorReminderRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UnregisterActorReminderRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UnregisterActorReminderRequest;
    static deserializeBinaryFromReader(message: UnregisterActorReminderRequest, reader: jspb.BinaryReader): UnregisterActorReminderRequest;
}

export namespace UnregisterActorReminderRequest {
    export type AsObject = {
        actorType: string,
        actorId: string,
        name: string,
    }
}

export class GetActorStateRequest extends jspb.Message { 
    getActorType(): string;
    setActorType(value: string): GetActorStateRequest;
    getActorId(): string;
    setActorId(value: string): GetActorStateRequest;
    getKey(): string;
    setKey(value: string): GetActorStateRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetActorStateRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetActorStateRequest): GetActorStateRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetActorStateRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetActorStateRequest;
    static deserializeBinaryFromReader(message: GetActorStateRequest, reader: jspb.BinaryReader): GetActorStateRequest;
}

export namespace GetActorStateRequest {
    export type AsObject = {
        actorType: string,
        actorId: string,
        key: string,
    }
}

export class GetActorStateResponse extends jspb.Message { 
    getData(): Uint8Array | string;
    getData_asU8(): Uint8Array;
    getData_asB64(): string;
    setData(value: Uint8Array | string): GetActorStateResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetActorStateResponse.AsObject;
    static toObject(includeInstance: boolean, msg: GetActorStateResponse): GetActorStateResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetActorStateResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetActorStateResponse;
    static deserializeBinaryFromReader(message: GetActorStateResponse, reader: jspb.BinaryReader): GetActorStateResponse;
}

export namespace GetActorStateResponse {
    export type AsObject = {
        data: Uint8Array | string,
    }
}

export class ExecuteActorStateTransactionRequest extends jspb.Message { 
    getActorType(): string;
    setActorType(value: string): ExecuteActorStateTransactionRequest;
    getActorId(): string;
    setActorId(value: string): ExecuteActorStateTransactionRequest;
    clearOperationsList(): void;
    getOperationsList(): Array<TransactionalActorStateOperation>;
    setOperationsList(value: Array<TransactionalActorStateOperation>): ExecuteActorStateTransactionRequest;
    addOperations(value?: TransactionalActorStateOperation, index?: number): TransactionalActorStateOperation;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ExecuteActorStateTransactionRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ExecuteActorStateTransactionRequest): ExecuteActorStateTransactionRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ExecuteActorStateTransactionRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ExecuteActorStateTransactionRequest;
    static deserializeBinaryFromReader(message: ExecuteActorStateTransactionRequest, reader: jspb.BinaryReader): ExecuteActorStateTransactionRequest;
}

export namespace ExecuteActorStateTransactionRequest {
    export type AsObject = {
        actorType: string,
        actorId: string,
        operationsList: Array<TransactionalActorStateOperation.AsObject>,
    }
}

export class TransactionalActorStateOperation extends jspb.Message { 
    getOperationtype(): string;
    setOperationtype(value: string): TransactionalActorStateOperation;
    getKey(): string;
    setKey(value: string): TransactionalActorStateOperation;

    hasValue(): boolean;
    clearValue(): void;
    getValue(): google_protobuf_any_pb.Any | undefined;
    setValue(value?: google_protobuf_any_pb.Any): TransactionalActorStateOperation;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TransactionalActorStateOperation.AsObject;
    static toObject(includeInstance: boolean, msg: TransactionalActorStateOperation): TransactionalActorStateOperation.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TransactionalActorStateOperation, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TransactionalActorStateOperation;
    static deserializeBinaryFromReader(message: TransactionalActorStateOperation, reader: jspb.BinaryReader): TransactionalActorStateOperation;
}

export namespace TransactionalActorStateOperation {
    export type AsObject = {
        operationtype: string,
        key: string,
        value?: google_protobuf_any_pb.Any.AsObject,
    }
}

export class InvokeActorRequest extends jspb.Message { 
    getActorType(): string;
    setActorType(value: string): InvokeActorRequest;
    getActorId(): string;
    setActorId(value: string): InvokeActorRequest;
    getMethod(): string;
    setMethod(value: string): InvokeActorRequest;
    getData(): Uint8Array | string;
    getData_asU8(): Uint8Array;
    getData_asB64(): string;
    setData(value: Uint8Array | string): InvokeActorRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): InvokeActorRequest.AsObject;
    static toObject(includeInstance: boolean, msg: InvokeActorRequest): InvokeActorRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: InvokeActorRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): InvokeActorRequest;
    static deserializeBinaryFromReader(message: InvokeActorRequest, reader: jspb.BinaryReader): InvokeActorRequest;
}

export namespace InvokeActorRequest {
    export type AsObject = {
        actorType: string,
        actorId: string,
        method: string,
        data: Uint8Array | string,
    }
}

export class InvokeActorResponse extends jspb.Message { 
    getData(): Uint8Array | string;
    getData_asU8(): Uint8Array;
    getData_asB64(): string;
    setData(value: Uint8Array | string): InvokeActorResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): InvokeActorResponse.AsObject;
    static toObject(includeInstance: boolean, msg: InvokeActorResponse): InvokeActorResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: InvokeActorResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): InvokeActorResponse;
    static deserializeBinaryFromReader(message: InvokeActorResponse, reader: jspb.BinaryReader): InvokeActorResponse;
}

export namespace InvokeActorResponse {
    export type AsObject = {
        data: Uint8Array | string,
    }
}

export class GetMetadataResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): GetMetadataResponse;
    clearActiveActorsCountList(): void;
    getActiveActorsCountList(): Array<ActiveActorsCount>;
    setActiveActorsCountList(value: Array<ActiveActorsCount>): GetMetadataResponse;
    addActiveActorsCount(value?: ActiveActorsCount, index?: number): ActiveActorsCount;
    clearRegisteredComponentsList(): void;
    getRegisteredComponentsList(): Array<RegisteredComponents>;
    setRegisteredComponentsList(value: Array<RegisteredComponents>): GetMetadataResponse;
    addRegisteredComponents(value?: RegisteredComponents, index?: number): RegisteredComponents;

    getExtendedMetadataMap(): jspb.Map<string, string>;
    clearExtendedMetadataMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetMetadataResponse.AsObject;
    static toObject(includeInstance: boolean, msg: GetMetadataResponse): GetMetadataResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetMetadataResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetMetadataResponse;
    static deserializeBinaryFromReader(message: GetMetadataResponse, reader: jspb.BinaryReader): GetMetadataResponse;
}

export namespace GetMetadataResponse {
    export type AsObject = {
        id: string,
        activeActorsCountList: Array<ActiveActorsCount.AsObject>,
        registeredComponentsList: Array<RegisteredComponents.AsObject>,

        extendedMetadataMap: Array<[string, string]>,
    }
}

export class ActiveActorsCount extends jspb.Message { 
    getType(): string;
    setType(value: string): ActiveActorsCount;
    getCount(): number;
    setCount(value: number): ActiveActorsCount;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ActiveActorsCount.AsObject;
    static toObject(includeInstance: boolean, msg: ActiveActorsCount): ActiveActorsCount.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ActiveActorsCount, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ActiveActorsCount;
    static deserializeBinaryFromReader(message: ActiveActorsCount, reader: jspb.BinaryReader): ActiveActorsCount;
}

export namespace ActiveActorsCount {
    export type AsObject = {
        type: string,
        count: number,
    }
}

export class RegisteredComponents extends jspb.Message { 
    getName(): string;
    setName(value: string): RegisteredComponents;
    getType(): string;
    setType(value: string): RegisteredComponents;
    getVersion(): string;
    setVersion(value: string): RegisteredComponents;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RegisteredComponents.AsObject;
    static toObject(includeInstance: boolean, msg: RegisteredComponents): RegisteredComponents.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RegisteredComponents, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RegisteredComponents;
    static deserializeBinaryFromReader(message: RegisteredComponents, reader: jspb.BinaryReader): RegisteredComponents;
}

export namespace RegisteredComponents {
    export type AsObject = {
        name: string,
        type: string,
        version: string,
    }
}

export class SetMetadataRequest extends jspb.Message { 
    getKey(): string;
    setKey(value: string): SetMetadataRequest;
    getValue(): string;
    setValue(value: string): SetMetadataRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SetMetadataRequest.AsObject;
    static toObject(includeInstance: boolean, msg: SetMetadataRequest): SetMetadataRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SetMetadataRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SetMetadataRequest;
    static deserializeBinaryFromReader(message: SetMetadataRequest, reader: jspb.BinaryReader): SetMetadataRequest;
}

export namespace SetMetadataRequest {
    export type AsObject = {
        key: string,
        value: string,
    }
}
