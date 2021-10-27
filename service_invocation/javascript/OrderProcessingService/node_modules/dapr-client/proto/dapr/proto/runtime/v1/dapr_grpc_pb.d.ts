// package: dapr.proto.runtime.v1
// file: dapr/proto/runtime/v1/dapr.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import {handleClientStreamingCall} from "@grpc/grpc-js/build/src/server-call";
import * as dapr_proto_runtime_v1_dapr_pb from "../../../../dapr/proto/runtime/v1/dapr_pb";
import * as google_protobuf_any_pb from "google-protobuf/google/protobuf/any_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";
import * as dapr_proto_common_v1_common_pb from "../../../../dapr/proto/common/v1/common_pb";

interface IDaprService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    invokeService: IDaprService_IInvokeService;
    getState: IDaprService_IGetState;
    getBulkState: IDaprService_IGetBulkState;
    saveState: IDaprService_ISaveState;
    deleteState: IDaprService_IDeleteState;
    deleteBulkState: IDaprService_IDeleteBulkState;
    executeStateTransaction: IDaprService_IExecuteStateTransaction;
    publishEvent: IDaprService_IPublishEvent;
    invokeBinding: IDaprService_IInvokeBinding;
    getSecret: IDaprService_IGetSecret;
    getBulkSecret: IDaprService_IGetBulkSecret;
    registerActorTimer: IDaprService_IRegisterActorTimer;
    unregisterActorTimer: IDaprService_IUnregisterActorTimer;
    registerActorReminder: IDaprService_IRegisterActorReminder;
    unregisterActorReminder: IDaprService_IUnregisterActorReminder;
    getActorState: IDaprService_IGetActorState;
    executeActorStateTransaction: IDaprService_IExecuteActorStateTransaction;
    invokeActor: IDaprService_IInvokeActor;
    getMetadata: IDaprService_IGetMetadata;
    setMetadata: IDaprService_ISetMetadata;
    shutdown: IDaprService_IShutdown;
}

interface IDaprService_IInvokeService extends grpc.MethodDefinition<dapr_proto_runtime_v1_dapr_pb.InvokeServiceRequest, dapr_proto_common_v1_common_pb.InvokeResponse> {
    path: "/dapr.proto.runtime.v1.Dapr/InvokeService";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.InvokeServiceRequest>;
    requestDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.InvokeServiceRequest>;
    responseSerialize: grpc.serialize<dapr_proto_common_v1_common_pb.InvokeResponse>;
    responseDeserialize: grpc.deserialize<dapr_proto_common_v1_common_pb.InvokeResponse>;
}
interface IDaprService_IGetState extends grpc.MethodDefinition<dapr_proto_runtime_v1_dapr_pb.GetStateRequest, dapr_proto_runtime_v1_dapr_pb.GetStateResponse> {
    path: "/dapr.proto.runtime.v1.Dapr/GetState";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.GetStateRequest>;
    requestDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.GetStateRequest>;
    responseSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.GetStateResponse>;
    responseDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.GetStateResponse>;
}
interface IDaprService_IGetBulkState extends grpc.MethodDefinition<dapr_proto_runtime_v1_dapr_pb.GetBulkStateRequest, dapr_proto_runtime_v1_dapr_pb.GetBulkStateResponse> {
    path: "/dapr.proto.runtime.v1.Dapr/GetBulkState";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.GetBulkStateRequest>;
    requestDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.GetBulkStateRequest>;
    responseSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.GetBulkStateResponse>;
    responseDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.GetBulkStateResponse>;
}
interface IDaprService_ISaveState extends grpc.MethodDefinition<dapr_proto_runtime_v1_dapr_pb.SaveStateRequest, google_protobuf_empty_pb.Empty> {
    path: "/dapr.proto.runtime.v1.Dapr/SaveState";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.SaveStateRequest>;
    requestDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.SaveStateRequest>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IDaprService_IDeleteState extends grpc.MethodDefinition<dapr_proto_runtime_v1_dapr_pb.DeleteStateRequest, google_protobuf_empty_pb.Empty> {
    path: "/dapr.proto.runtime.v1.Dapr/DeleteState";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.DeleteStateRequest>;
    requestDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.DeleteStateRequest>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IDaprService_IDeleteBulkState extends grpc.MethodDefinition<dapr_proto_runtime_v1_dapr_pb.DeleteBulkStateRequest, google_protobuf_empty_pb.Empty> {
    path: "/dapr.proto.runtime.v1.Dapr/DeleteBulkState";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.DeleteBulkStateRequest>;
    requestDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.DeleteBulkStateRequest>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IDaprService_IExecuteStateTransaction extends grpc.MethodDefinition<dapr_proto_runtime_v1_dapr_pb.ExecuteStateTransactionRequest, google_protobuf_empty_pb.Empty> {
    path: "/dapr.proto.runtime.v1.Dapr/ExecuteStateTransaction";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.ExecuteStateTransactionRequest>;
    requestDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.ExecuteStateTransactionRequest>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IDaprService_IPublishEvent extends grpc.MethodDefinition<dapr_proto_runtime_v1_dapr_pb.PublishEventRequest, google_protobuf_empty_pb.Empty> {
    path: "/dapr.proto.runtime.v1.Dapr/PublishEvent";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.PublishEventRequest>;
    requestDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.PublishEventRequest>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IDaprService_IInvokeBinding extends grpc.MethodDefinition<dapr_proto_runtime_v1_dapr_pb.InvokeBindingRequest, dapr_proto_runtime_v1_dapr_pb.InvokeBindingResponse> {
    path: "/dapr.proto.runtime.v1.Dapr/InvokeBinding";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.InvokeBindingRequest>;
    requestDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.InvokeBindingRequest>;
    responseSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.InvokeBindingResponse>;
    responseDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.InvokeBindingResponse>;
}
interface IDaprService_IGetSecret extends grpc.MethodDefinition<dapr_proto_runtime_v1_dapr_pb.GetSecretRequest, dapr_proto_runtime_v1_dapr_pb.GetSecretResponse> {
    path: "/dapr.proto.runtime.v1.Dapr/GetSecret";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.GetSecretRequest>;
    requestDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.GetSecretRequest>;
    responseSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.GetSecretResponse>;
    responseDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.GetSecretResponse>;
}
interface IDaprService_IGetBulkSecret extends grpc.MethodDefinition<dapr_proto_runtime_v1_dapr_pb.GetBulkSecretRequest, dapr_proto_runtime_v1_dapr_pb.GetBulkSecretResponse> {
    path: "/dapr.proto.runtime.v1.Dapr/GetBulkSecret";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.GetBulkSecretRequest>;
    requestDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.GetBulkSecretRequest>;
    responseSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.GetBulkSecretResponse>;
    responseDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.GetBulkSecretResponse>;
}
interface IDaprService_IRegisterActorTimer extends grpc.MethodDefinition<dapr_proto_runtime_v1_dapr_pb.RegisterActorTimerRequest, google_protobuf_empty_pb.Empty> {
    path: "/dapr.proto.runtime.v1.Dapr/RegisterActorTimer";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.RegisterActorTimerRequest>;
    requestDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.RegisterActorTimerRequest>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IDaprService_IUnregisterActorTimer extends grpc.MethodDefinition<dapr_proto_runtime_v1_dapr_pb.UnregisterActorTimerRequest, google_protobuf_empty_pb.Empty> {
    path: "/dapr.proto.runtime.v1.Dapr/UnregisterActorTimer";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.UnregisterActorTimerRequest>;
    requestDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.UnregisterActorTimerRequest>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IDaprService_IRegisterActorReminder extends grpc.MethodDefinition<dapr_proto_runtime_v1_dapr_pb.RegisterActorReminderRequest, google_protobuf_empty_pb.Empty> {
    path: "/dapr.proto.runtime.v1.Dapr/RegisterActorReminder";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.RegisterActorReminderRequest>;
    requestDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.RegisterActorReminderRequest>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IDaprService_IUnregisterActorReminder extends grpc.MethodDefinition<dapr_proto_runtime_v1_dapr_pb.UnregisterActorReminderRequest, google_protobuf_empty_pb.Empty> {
    path: "/dapr.proto.runtime.v1.Dapr/UnregisterActorReminder";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.UnregisterActorReminderRequest>;
    requestDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.UnregisterActorReminderRequest>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IDaprService_IGetActorState extends grpc.MethodDefinition<dapr_proto_runtime_v1_dapr_pb.GetActorStateRequest, dapr_proto_runtime_v1_dapr_pb.GetActorStateResponse> {
    path: "/dapr.proto.runtime.v1.Dapr/GetActorState";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.GetActorStateRequest>;
    requestDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.GetActorStateRequest>;
    responseSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.GetActorStateResponse>;
    responseDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.GetActorStateResponse>;
}
interface IDaprService_IExecuteActorStateTransaction extends grpc.MethodDefinition<dapr_proto_runtime_v1_dapr_pb.ExecuteActorStateTransactionRequest, google_protobuf_empty_pb.Empty> {
    path: "/dapr.proto.runtime.v1.Dapr/ExecuteActorStateTransaction";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.ExecuteActorStateTransactionRequest>;
    requestDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.ExecuteActorStateTransactionRequest>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IDaprService_IInvokeActor extends grpc.MethodDefinition<dapr_proto_runtime_v1_dapr_pb.InvokeActorRequest, dapr_proto_runtime_v1_dapr_pb.InvokeActorResponse> {
    path: "/dapr.proto.runtime.v1.Dapr/InvokeActor";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.InvokeActorRequest>;
    requestDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.InvokeActorRequest>;
    responseSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.InvokeActorResponse>;
    responseDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.InvokeActorResponse>;
}
interface IDaprService_IGetMetadata extends grpc.MethodDefinition<google_protobuf_empty_pb.Empty, dapr_proto_runtime_v1_dapr_pb.GetMetadataResponse> {
    path: "/dapr.proto.runtime.v1.Dapr/GetMetadata";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    requestDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
    responseSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.GetMetadataResponse>;
    responseDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.GetMetadataResponse>;
}
interface IDaprService_ISetMetadata extends grpc.MethodDefinition<dapr_proto_runtime_v1_dapr_pb.SetMetadataRequest, google_protobuf_empty_pb.Empty> {
    path: "/dapr.proto.runtime.v1.Dapr/SetMetadata";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapr_proto_runtime_v1_dapr_pb.SetMetadataRequest>;
    requestDeserialize: grpc.deserialize<dapr_proto_runtime_v1_dapr_pb.SetMetadataRequest>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IDaprService_IShutdown extends grpc.MethodDefinition<google_protobuf_empty_pb.Empty, google_protobuf_empty_pb.Empty> {
    path: "/dapr.proto.runtime.v1.Dapr/Shutdown";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    requestDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}

export const DaprService: IDaprService;

export interface IDaprServer extends grpc.UntypedServiceImplementation {
    invokeService: grpc.handleUnaryCall<dapr_proto_runtime_v1_dapr_pb.InvokeServiceRequest, dapr_proto_common_v1_common_pb.InvokeResponse>;
    getState: grpc.handleUnaryCall<dapr_proto_runtime_v1_dapr_pb.GetStateRequest, dapr_proto_runtime_v1_dapr_pb.GetStateResponse>;
    getBulkState: grpc.handleUnaryCall<dapr_proto_runtime_v1_dapr_pb.GetBulkStateRequest, dapr_proto_runtime_v1_dapr_pb.GetBulkStateResponse>;
    saveState: grpc.handleUnaryCall<dapr_proto_runtime_v1_dapr_pb.SaveStateRequest, google_protobuf_empty_pb.Empty>;
    deleteState: grpc.handleUnaryCall<dapr_proto_runtime_v1_dapr_pb.DeleteStateRequest, google_protobuf_empty_pb.Empty>;
    deleteBulkState: grpc.handleUnaryCall<dapr_proto_runtime_v1_dapr_pb.DeleteBulkStateRequest, google_protobuf_empty_pb.Empty>;
    executeStateTransaction: grpc.handleUnaryCall<dapr_proto_runtime_v1_dapr_pb.ExecuteStateTransactionRequest, google_protobuf_empty_pb.Empty>;
    publishEvent: grpc.handleUnaryCall<dapr_proto_runtime_v1_dapr_pb.PublishEventRequest, google_protobuf_empty_pb.Empty>;
    invokeBinding: grpc.handleUnaryCall<dapr_proto_runtime_v1_dapr_pb.InvokeBindingRequest, dapr_proto_runtime_v1_dapr_pb.InvokeBindingResponse>;
    getSecret: grpc.handleUnaryCall<dapr_proto_runtime_v1_dapr_pb.GetSecretRequest, dapr_proto_runtime_v1_dapr_pb.GetSecretResponse>;
    getBulkSecret: grpc.handleUnaryCall<dapr_proto_runtime_v1_dapr_pb.GetBulkSecretRequest, dapr_proto_runtime_v1_dapr_pb.GetBulkSecretResponse>;
    registerActorTimer: grpc.handleUnaryCall<dapr_proto_runtime_v1_dapr_pb.RegisterActorTimerRequest, google_protobuf_empty_pb.Empty>;
    unregisterActorTimer: grpc.handleUnaryCall<dapr_proto_runtime_v1_dapr_pb.UnregisterActorTimerRequest, google_protobuf_empty_pb.Empty>;
    registerActorReminder: grpc.handleUnaryCall<dapr_proto_runtime_v1_dapr_pb.RegisterActorReminderRequest, google_protobuf_empty_pb.Empty>;
    unregisterActorReminder: grpc.handleUnaryCall<dapr_proto_runtime_v1_dapr_pb.UnregisterActorReminderRequest, google_protobuf_empty_pb.Empty>;
    getActorState: grpc.handleUnaryCall<dapr_proto_runtime_v1_dapr_pb.GetActorStateRequest, dapr_proto_runtime_v1_dapr_pb.GetActorStateResponse>;
    executeActorStateTransaction: grpc.handleUnaryCall<dapr_proto_runtime_v1_dapr_pb.ExecuteActorStateTransactionRequest, google_protobuf_empty_pb.Empty>;
    invokeActor: grpc.handleUnaryCall<dapr_proto_runtime_v1_dapr_pb.InvokeActorRequest, dapr_proto_runtime_v1_dapr_pb.InvokeActorResponse>;
    getMetadata: grpc.handleUnaryCall<google_protobuf_empty_pb.Empty, dapr_proto_runtime_v1_dapr_pb.GetMetadataResponse>;
    setMetadata: grpc.handleUnaryCall<dapr_proto_runtime_v1_dapr_pb.SetMetadataRequest, google_protobuf_empty_pb.Empty>;
    shutdown: grpc.handleUnaryCall<google_protobuf_empty_pb.Empty, google_protobuf_empty_pb.Empty>;
}

export interface IDaprClient {
    invokeService(request: dapr_proto_runtime_v1_dapr_pb.InvokeServiceRequest, callback: (error: grpc.ServiceError | null, response: dapr_proto_common_v1_common_pb.InvokeResponse) => void): grpc.ClientUnaryCall;
    invokeService(request: dapr_proto_runtime_v1_dapr_pb.InvokeServiceRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_common_v1_common_pb.InvokeResponse) => void): grpc.ClientUnaryCall;
    invokeService(request: dapr_proto_runtime_v1_dapr_pb.InvokeServiceRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_common_v1_common_pb.InvokeResponse) => void): grpc.ClientUnaryCall;
    getState(request: dapr_proto_runtime_v1_dapr_pb.GetStateRequest, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetStateResponse) => void): grpc.ClientUnaryCall;
    getState(request: dapr_proto_runtime_v1_dapr_pb.GetStateRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetStateResponse) => void): grpc.ClientUnaryCall;
    getState(request: dapr_proto_runtime_v1_dapr_pb.GetStateRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetStateResponse) => void): grpc.ClientUnaryCall;
    getBulkState(request: dapr_proto_runtime_v1_dapr_pb.GetBulkStateRequest, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetBulkStateResponse) => void): grpc.ClientUnaryCall;
    getBulkState(request: dapr_proto_runtime_v1_dapr_pb.GetBulkStateRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetBulkStateResponse) => void): grpc.ClientUnaryCall;
    getBulkState(request: dapr_proto_runtime_v1_dapr_pb.GetBulkStateRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetBulkStateResponse) => void): grpc.ClientUnaryCall;
    saveState(request: dapr_proto_runtime_v1_dapr_pb.SaveStateRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    saveState(request: dapr_proto_runtime_v1_dapr_pb.SaveStateRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    saveState(request: dapr_proto_runtime_v1_dapr_pb.SaveStateRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    deleteState(request: dapr_proto_runtime_v1_dapr_pb.DeleteStateRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    deleteState(request: dapr_proto_runtime_v1_dapr_pb.DeleteStateRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    deleteState(request: dapr_proto_runtime_v1_dapr_pb.DeleteStateRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    deleteBulkState(request: dapr_proto_runtime_v1_dapr_pb.DeleteBulkStateRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    deleteBulkState(request: dapr_proto_runtime_v1_dapr_pb.DeleteBulkStateRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    deleteBulkState(request: dapr_proto_runtime_v1_dapr_pb.DeleteBulkStateRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    executeStateTransaction(request: dapr_proto_runtime_v1_dapr_pb.ExecuteStateTransactionRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    executeStateTransaction(request: dapr_proto_runtime_v1_dapr_pb.ExecuteStateTransactionRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    executeStateTransaction(request: dapr_proto_runtime_v1_dapr_pb.ExecuteStateTransactionRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    publishEvent(request: dapr_proto_runtime_v1_dapr_pb.PublishEventRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    publishEvent(request: dapr_proto_runtime_v1_dapr_pb.PublishEventRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    publishEvent(request: dapr_proto_runtime_v1_dapr_pb.PublishEventRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    invokeBinding(request: dapr_proto_runtime_v1_dapr_pb.InvokeBindingRequest, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.InvokeBindingResponse) => void): grpc.ClientUnaryCall;
    invokeBinding(request: dapr_proto_runtime_v1_dapr_pb.InvokeBindingRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.InvokeBindingResponse) => void): grpc.ClientUnaryCall;
    invokeBinding(request: dapr_proto_runtime_v1_dapr_pb.InvokeBindingRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.InvokeBindingResponse) => void): grpc.ClientUnaryCall;
    getSecret(request: dapr_proto_runtime_v1_dapr_pb.GetSecretRequest, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetSecretResponse) => void): grpc.ClientUnaryCall;
    getSecret(request: dapr_proto_runtime_v1_dapr_pb.GetSecretRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetSecretResponse) => void): grpc.ClientUnaryCall;
    getSecret(request: dapr_proto_runtime_v1_dapr_pb.GetSecretRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetSecretResponse) => void): grpc.ClientUnaryCall;
    getBulkSecret(request: dapr_proto_runtime_v1_dapr_pb.GetBulkSecretRequest, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetBulkSecretResponse) => void): grpc.ClientUnaryCall;
    getBulkSecret(request: dapr_proto_runtime_v1_dapr_pb.GetBulkSecretRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetBulkSecretResponse) => void): grpc.ClientUnaryCall;
    getBulkSecret(request: dapr_proto_runtime_v1_dapr_pb.GetBulkSecretRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetBulkSecretResponse) => void): grpc.ClientUnaryCall;
    registerActorTimer(request: dapr_proto_runtime_v1_dapr_pb.RegisterActorTimerRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    registerActorTimer(request: dapr_proto_runtime_v1_dapr_pb.RegisterActorTimerRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    registerActorTimer(request: dapr_proto_runtime_v1_dapr_pb.RegisterActorTimerRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    unregisterActorTimer(request: dapr_proto_runtime_v1_dapr_pb.UnregisterActorTimerRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    unregisterActorTimer(request: dapr_proto_runtime_v1_dapr_pb.UnregisterActorTimerRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    unregisterActorTimer(request: dapr_proto_runtime_v1_dapr_pb.UnregisterActorTimerRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    registerActorReminder(request: dapr_proto_runtime_v1_dapr_pb.RegisterActorReminderRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    registerActorReminder(request: dapr_proto_runtime_v1_dapr_pb.RegisterActorReminderRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    registerActorReminder(request: dapr_proto_runtime_v1_dapr_pb.RegisterActorReminderRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    unregisterActorReminder(request: dapr_proto_runtime_v1_dapr_pb.UnregisterActorReminderRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    unregisterActorReminder(request: dapr_proto_runtime_v1_dapr_pb.UnregisterActorReminderRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    unregisterActorReminder(request: dapr_proto_runtime_v1_dapr_pb.UnregisterActorReminderRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    getActorState(request: dapr_proto_runtime_v1_dapr_pb.GetActorStateRequest, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetActorStateResponse) => void): grpc.ClientUnaryCall;
    getActorState(request: dapr_proto_runtime_v1_dapr_pb.GetActorStateRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetActorStateResponse) => void): grpc.ClientUnaryCall;
    getActorState(request: dapr_proto_runtime_v1_dapr_pb.GetActorStateRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetActorStateResponse) => void): grpc.ClientUnaryCall;
    executeActorStateTransaction(request: dapr_proto_runtime_v1_dapr_pb.ExecuteActorStateTransactionRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    executeActorStateTransaction(request: dapr_proto_runtime_v1_dapr_pb.ExecuteActorStateTransactionRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    executeActorStateTransaction(request: dapr_proto_runtime_v1_dapr_pb.ExecuteActorStateTransactionRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    invokeActor(request: dapr_proto_runtime_v1_dapr_pb.InvokeActorRequest, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.InvokeActorResponse) => void): grpc.ClientUnaryCall;
    invokeActor(request: dapr_proto_runtime_v1_dapr_pb.InvokeActorRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.InvokeActorResponse) => void): grpc.ClientUnaryCall;
    invokeActor(request: dapr_proto_runtime_v1_dapr_pb.InvokeActorRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.InvokeActorResponse) => void): grpc.ClientUnaryCall;
    getMetadata(request: google_protobuf_empty_pb.Empty, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetMetadataResponse) => void): grpc.ClientUnaryCall;
    getMetadata(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetMetadataResponse) => void): grpc.ClientUnaryCall;
    getMetadata(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetMetadataResponse) => void): grpc.ClientUnaryCall;
    setMetadata(request: dapr_proto_runtime_v1_dapr_pb.SetMetadataRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    setMetadata(request: dapr_proto_runtime_v1_dapr_pb.SetMetadataRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    setMetadata(request: dapr_proto_runtime_v1_dapr_pb.SetMetadataRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    shutdown(request: google_protobuf_empty_pb.Empty, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    shutdown(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    shutdown(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
}

export class DaprClient extends grpc.Client implements IDaprClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public invokeService(request: dapr_proto_runtime_v1_dapr_pb.InvokeServiceRequest, callback: (error: grpc.ServiceError | null, response: dapr_proto_common_v1_common_pb.InvokeResponse) => void): grpc.ClientUnaryCall;
    public invokeService(request: dapr_proto_runtime_v1_dapr_pb.InvokeServiceRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_common_v1_common_pb.InvokeResponse) => void): grpc.ClientUnaryCall;
    public invokeService(request: dapr_proto_runtime_v1_dapr_pb.InvokeServiceRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_common_v1_common_pb.InvokeResponse) => void): grpc.ClientUnaryCall;
    public getState(request: dapr_proto_runtime_v1_dapr_pb.GetStateRequest, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetStateResponse) => void): grpc.ClientUnaryCall;
    public getState(request: dapr_proto_runtime_v1_dapr_pb.GetStateRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetStateResponse) => void): grpc.ClientUnaryCall;
    public getState(request: dapr_proto_runtime_v1_dapr_pb.GetStateRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetStateResponse) => void): grpc.ClientUnaryCall;
    public getBulkState(request: dapr_proto_runtime_v1_dapr_pb.GetBulkStateRequest, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetBulkStateResponse) => void): grpc.ClientUnaryCall;
    public getBulkState(request: dapr_proto_runtime_v1_dapr_pb.GetBulkStateRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetBulkStateResponse) => void): grpc.ClientUnaryCall;
    public getBulkState(request: dapr_proto_runtime_v1_dapr_pb.GetBulkStateRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetBulkStateResponse) => void): grpc.ClientUnaryCall;
    public saveState(request: dapr_proto_runtime_v1_dapr_pb.SaveStateRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public saveState(request: dapr_proto_runtime_v1_dapr_pb.SaveStateRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public saveState(request: dapr_proto_runtime_v1_dapr_pb.SaveStateRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public deleteState(request: dapr_proto_runtime_v1_dapr_pb.DeleteStateRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public deleteState(request: dapr_proto_runtime_v1_dapr_pb.DeleteStateRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public deleteState(request: dapr_proto_runtime_v1_dapr_pb.DeleteStateRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public deleteBulkState(request: dapr_proto_runtime_v1_dapr_pb.DeleteBulkStateRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public deleteBulkState(request: dapr_proto_runtime_v1_dapr_pb.DeleteBulkStateRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public deleteBulkState(request: dapr_proto_runtime_v1_dapr_pb.DeleteBulkStateRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public executeStateTransaction(request: dapr_proto_runtime_v1_dapr_pb.ExecuteStateTransactionRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public executeStateTransaction(request: dapr_proto_runtime_v1_dapr_pb.ExecuteStateTransactionRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public executeStateTransaction(request: dapr_proto_runtime_v1_dapr_pb.ExecuteStateTransactionRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public publishEvent(request: dapr_proto_runtime_v1_dapr_pb.PublishEventRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public publishEvent(request: dapr_proto_runtime_v1_dapr_pb.PublishEventRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public publishEvent(request: dapr_proto_runtime_v1_dapr_pb.PublishEventRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public invokeBinding(request: dapr_proto_runtime_v1_dapr_pb.InvokeBindingRequest, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.InvokeBindingResponse) => void): grpc.ClientUnaryCall;
    public invokeBinding(request: dapr_proto_runtime_v1_dapr_pb.InvokeBindingRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.InvokeBindingResponse) => void): grpc.ClientUnaryCall;
    public invokeBinding(request: dapr_proto_runtime_v1_dapr_pb.InvokeBindingRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.InvokeBindingResponse) => void): grpc.ClientUnaryCall;
    public getSecret(request: dapr_proto_runtime_v1_dapr_pb.GetSecretRequest, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetSecretResponse) => void): grpc.ClientUnaryCall;
    public getSecret(request: dapr_proto_runtime_v1_dapr_pb.GetSecretRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetSecretResponse) => void): grpc.ClientUnaryCall;
    public getSecret(request: dapr_proto_runtime_v1_dapr_pb.GetSecretRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetSecretResponse) => void): grpc.ClientUnaryCall;
    public getBulkSecret(request: dapr_proto_runtime_v1_dapr_pb.GetBulkSecretRequest, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetBulkSecretResponse) => void): grpc.ClientUnaryCall;
    public getBulkSecret(request: dapr_proto_runtime_v1_dapr_pb.GetBulkSecretRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetBulkSecretResponse) => void): grpc.ClientUnaryCall;
    public getBulkSecret(request: dapr_proto_runtime_v1_dapr_pb.GetBulkSecretRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetBulkSecretResponse) => void): grpc.ClientUnaryCall;
    public registerActorTimer(request: dapr_proto_runtime_v1_dapr_pb.RegisterActorTimerRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public registerActorTimer(request: dapr_proto_runtime_v1_dapr_pb.RegisterActorTimerRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public registerActorTimer(request: dapr_proto_runtime_v1_dapr_pb.RegisterActorTimerRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public unregisterActorTimer(request: dapr_proto_runtime_v1_dapr_pb.UnregisterActorTimerRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public unregisterActorTimer(request: dapr_proto_runtime_v1_dapr_pb.UnregisterActorTimerRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public unregisterActorTimer(request: dapr_proto_runtime_v1_dapr_pb.UnregisterActorTimerRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public registerActorReminder(request: dapr_proto_runtime_v1_dapr_pb.RegisterActorReminderRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public registerActorReminder(request: dapr_proto_runtime_v1_dapr_pb.RegisterActorReminderRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public registerActorReminder(request: dapr_proto_runtime_v1_dapr_pb.RegisterActorReminderRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public unregisterActorReminder(request: dapr_proto_runtime_v1_dapr_pb.UnregisterActorReminderRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public unregisterActorReminder(request: dapr_proto_runtime_v1_dapr_pb.UnregisterActorReminderRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public unregisterActorReminder(request: dapr_proto_runtime_v1_dapr_pb.UnregisterActorReminderRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public getActorState(request: dapr_proto_runtime_v1_dapr_pb.GetActorStateRequest, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetActorStateResponse) => void): grpc.ClientUnaryCall;
    public getActorState(request: dapr_proto_runtime_v1_dapr_pb.GetActorStateRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetActorStateResponse) => void): grpc.ClientUnaryCall;
    public getActorState(request: dapr_proto_runtime_v1_dapr_pb.GetActorStateRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetActorStateResponse) => void): grpc.ClientUnaryCall;
    public executeActorStateTransaction(request: dapr_proto_runtime_v1_dapr_pb.ExecuteActorStateTransactionRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public executeActorStateTransaction(request: dapr_proto_runtime_v1_dapr_pb.ExecuteActorStateTransactionRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public executeActorStateTransaction(request: dapr_proto_runtime_v1_dapr_pb.ExecuteActorStateTransactionRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public invokeActor(request: dapr_proto_runtime_v1_dapr_pb.InvokeActorRequest, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.InvokeActorResponse) => void): grpc.ClientUnaryCall;
    public invokeActor(request: dapr_proto_runtime_v1_dapr_pb.InvokeActorRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.InvokeActorResponse) => void): grpc.ClientUnaryCall;
    public invokeActor(request: dapr_proto_runtime_v1_dapr_pb.InvokeActorRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.InvokeActorResponse) => void): grpc.ClientUnaryCall;
    public getMetadata(request: google_protobuf_empty_pb.Empty, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetMetadataResponse) => void): grpc.ClientUnaryCall;
    public getMetadata(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetMetadataResponse) => void): grpc.ClientUnaryCall;
    public getMetadata(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_dapr_pb.GetMetadataResponse) => void): grpc.ClientUnaryCall;
    public setMetadata(request: dapr_proto_runtime_v1_dapr_pb.SetMetadataRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public setMetadata(request: dapr_proto_runtime_v1_dapr_pb.SetMetadataRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public setMetadata(request: dapr_proto_runtime_v1_dapr_pb.SetMetadataRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public shutdown(request: google_protobuf_empty_pb.Empty, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public shutdown(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public shutdown(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
}
