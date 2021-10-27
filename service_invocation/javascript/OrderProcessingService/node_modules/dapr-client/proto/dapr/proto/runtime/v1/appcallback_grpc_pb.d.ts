// package: dapr.proto.runtime.v1
// file: dapr/proto/runtime/v1/appcallback.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import {handleClientStreamingCall} from "@grpc/grpc-js/build/src/server-call";
import * as dapr_proto_runtime_v1_appcallback_pb from "../../../../dapr/proto/runtime/v1/appcallback_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";
import * as dapr_proto_common_v1_common_pb from "../../../../dapr/proto/common/v1/common_pb";

interface IAppCallbackService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    onInvoke: IAppCallbackService_IOnInvoke;
    listTopicSubscriptions: IAppCallbackService_IListTopicSubscriptions;
    onTopicEvent: IAppCallbackService_IOnTopicEvent;
    listInputBindings: IAppCallbackService_IListInputBindings;
    onBindingEvent: IAppCallbackService_IOnBindingEvent;
}

interface IAppCallbackService_IOnInvoke extends grpc.MethodDefinition<dapr_proto_common_v1_common_pb.InvokeRequest, dapr_proto_common_v1_common_pb.InvokeResponse> {
    path: "/dapr.proto.runtime.v1.AppCallback/OnInvoke";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapr_proto_common_v1_common_pb.InvokeRequest>;
    requestDeserialize: grpc.deserialize<dapr_proto_common_v1_common_pb.InvokeRequest>;
    responseSerialize: grpc.serialize<dapr_proto_common_v1_common_pb.InvokeResponse>;
    responseDeserialize: grpc.deserialize<dapr_proto_common_v1_common_pb.InvokeResponse>;
}
interface IAppCallbackService_IListTopicSubscriptions extends grpc.MethodDefinition<google_protobuf_empty_pb.Empty, dapr_proto_runtime_v1_appcallback_pb.ListTopicSubscriptionsResponse> {
    path: "/dapr.proto.runtime.v1.AppCallback/ListTopicSubscriptions";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    requestDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
    responseSerialize: grpc.serialize<dapr_proto_runtime_v1_appcallback_pb.ListTopicSubscriptionsResponse>;
    responseDeserialize: grpc.deserialize<dapr_proto_runtime_v1_appcallback_pb.ListTopicSubscriptionsResponse>;
}
interface IAppCallbackService_IOnTopicEvent extends grpc.MethodDefinition<dapr_proto_runtime_v1_appcallback_pb.TopicEventRequest, dapr_proto_runtime_v1_appcallback_pb.TopicEventResponse> {
    path: "/dapr.proto.runtime.v1.AppCallback/OnTopicEvent";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapr_proto_runtime_v1_appcallback_pb.TopicEventRequest>;
    requestDeserialize: grpc.deserialize<dapr_proto_runtime_v1_appcallback_pb.TopicEventRequest>;
    responseSerialize: grpc.serialize<dapr_proto_runtime_v1_appcallback_pb.TopicEventResponse>;
    responseDeserialize: grpc.deserialize<dapr_proto_runtime_v1_appcallback_pb.TopicEventResponse>;
}
interface IAppCallbackService_IListInputBindings extends grpc.MethodDefinition<google_protobuf_empty_pb.Empty, dapr_proto_runtime_v1_appcallback_pb.ListInputBindingsResponse> {
    path: "/dapr.proto.runtime.v1.AppCallback/ListInputBindings";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    requestDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
    responseSerialize: grpc.serialize<dapr_proto_runtime_v1_appcallback_pb.ListInputBindingsResponse>;
    responseDeserialize: grpc.deserialize<dapr_proto_runtime_v1_appcallback_pb.ListInputBindingsResponse>;
}
interface IAppCallbackService_IOnBindingEvent extends grpc.MethodDefinition<dapr_proto_runtime_v1_appcallback_pb.BindingEventRequest, dapr_proto_runtime_v1_appcallback_pb.BindingEventResponse> {
    path: "/dapr.proto.runtime.v1.AppCallback/OnBindingEvent";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapr_proto_runtime_v1_appcallback_pb.BindingEventRequest>;
    requestDeserialize: grpc.deserialize<dapr_proto_runtime_v1_appcallback_pb.BindingEventRequest>;
    responseSerialize: grpc.serialize<dapr_proto_runtime_v1_appcallback_pb.BindingEventResponse>;
    responseDeserialize: grpc.deserialize<dapr_proto_runtime_v1_appcallback_pb.BindingEventResponse>;
}

export const AppCallbackService: IAppCallbackService;

export interface IAppCallbackServer extends grpc.UntypedServiceImplementation {
    onInvoke: grpc.handleUnaryCall<dapr_proto_common_v1_common_pb.InvokeRequest, dapr_proto_common_v1_common_pb.InvokeResponse>;
    listTopicSubscriptions: grpc.handleUnaryCall<google_protobuf_empty_pb.Empty, dapr_proto_runtime_v1_appcallback_pb.ListTopicSubscriptionsResponse>;
    onTopicEvent: grpc.handleUnaryCall<dapr_proto_runtime_v1_appcallback_pb.TopicEventRequest, dapr_proto_runtime_v1_appcallback_pb.TopicEventResponse>;
    listInputBindings: grpc.handleUnaryCall<google_protobuf_empty_pb.Empty, dapr_proto_runtime_v1_appcallback_pb.ListInputBindingsResponse>;
    onBindingEvent: grpc.handleUnaryCall<dapr_proto_runtime_v1_appcallback_pb.BindingEventRequest, dapr_proto_runtime_v1_appcallback_pb.BindingEventResponse>;
}

export interface IAppCallbackClient {
    onInvoke(request: dapr_proto_common_v1_common_pb.InvokeRequest, callback: (error: grpc.ServiceError | null, response: dapr_proto_common_v1_common_pb.InvokeResponse) => void): grpc.ClientUnaryCall;
    onInvoke(request: dapr_proto_common_v1_common_pb.InvokeRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_common_v1_common_pb.InvokeResponse) => void): grpc.ClientUnaryCall;
    onInvoke(request: dapr_proto_common_v1_common_pb.InvokeRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_common_v1_common_pb.InvokeResponse) => void): grpc.ClientUnaryCall;
    listTopicSubscriptions(request: google_protobuf_empty_pb.Empty, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_appcallback_pb.ListTopicSubscriptionsResponse) => void): grpc.ClientUnaryCall;
    listTopicSubscriptions(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_appcallback_pb.ListTopicSubscriptionsResponse) => void): grpc.ClientUnaryCall;
    listTopicSubscriptions(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_appcallback_pb.ListTopicSubscriptionsResponse) => void): grpc.ClientUnaryCall;
    onTopicEvent(request: dapr_proto_runtime_v1_appcallback_pb.TopicEventRequest, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_appcallback_pb.TopicEventResponse) => void): grpc.ClientUnaryCall;
    onTopicEvent(request: dapr_proto_runtime_v1_appcallback_pb.TopicEventRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_appcallback_pb.TopicEventResponse) => void): grpc.ClientUnaryCall;
    onTopicEvent(request: dapr_proto_runtime_v1_appcallback_pb.TopicEventRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_appcallback_pb.TopicEventResponse) => void): grpc.ClientUnaryCall;
    listInputBindings(request: google_protobuf_empty_pb.Empty, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_appcallback_pb.ListInputBindingsResponse) => void): grpc.ClientUnaryCall;
    listInputBindings(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_appcallback_pb.ListInputBindingsResponse) => void): grpc.ClientUnaryCall;
    listInputBindings(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_appcallback_pb.ListInputBindingsResponse) => void): grpc.ClientUnaryCall;
    onBindingEvent(request: dapr_proto_runtime_v1_appcallback_pb.BindingEventRequest, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_appcallback_pb.BindingEventResponse) => void): grpc.ClientUnaryCall;
    onBindingEvent(request: dapr_proto_runtime_v1_appcallback_pb.BindingEventRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_appcallback_pb.BindingEventResponse) => void): grpc.ClientUnaryCall;
    onBindingEvent(request: dapr_proto_runtime_v1_appcallback_pb.BindingEventRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_appcallback_pb.BindingEventResponse) => void): grpc.ClientUnaryCall;
}

export class AppCallbackClient extends grpc.Client implements IAppCallbackClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public onInvoke(request: dapr_proto_common_v1_common_pb.InvokeRequest, callback: (error: grpc.ServiceError | null, response: dapr_proto_common_v1_common_pb.InvokeResponse) => void): grpc.ClientUnaryCall;
    public onInvoke(request: dapr_proto_common_v1_common_pb.InvokeRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_common_v1_common_pb.InvokeResponse) => void): grpc.ClientUnaryCall;
    public onInvoke(request: dapr_proto_common_v1_common_pb.InvokeRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_common_v1_common_pb.InvokeResponse) => void): grpc.ClientUnaryCall;
    public listTopicSubscriptions(request: google_protobuf_empty_pb.Empty, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_appcallback_pb.ListTopicSubscriptionsResponse) => void): grpc.ClientUnaryCall;
    public listTopicSubscriptions(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_appcallback_pb.ListTopicSubscriptionsResponse) => void): grpc.ClientUnaryCall;
    public listTopicSubscriptions(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_appcallback_pb.ListTopicSubscriptionsResponse) => void): grpc.ClientUnaryCall;
    public onTopicEvent(request: dapr_proto_runtime_v1_appcallback_pb.TopicEventRequest, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_appcallback_pb.TopicEventResponse) => void): grpc.ClientUnaryCall;
    public onTopicEvent(request: dapr_proto_runtime_v1_appcallback_pb.TopicEventRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_appcallback_pb.TopicEventResponse) => void): grpc.ClientUnaryCall;
    public onTopicEvent(request: dapr_proto_runtime_v1_appcallback_pb.TopicEventRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_appcallback_pb.TopicEventResponse) => void): grpc.ClientUnaryCall;
    public listInputBindings(request: google_protobuf_empty_pb.Empty, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_appcallback_pb.ListInputBindingsResponse) => void): grpc.ClientUnaryCall;
    public listInputBindings(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_appcallback_pb.ListInputBindingsResponse) => void): grpc.ClientUnaryCall;
    public listInputBindings(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_appcallback_pb.ListInputBindingsResponse) => void): grpc.ClientUnaryCall;
    public onBindingEvent(request: dapr_proto_runtime_v1_appcallback_pb.BindingEventRequest, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_appcallback_pb.BindingEventResponse) => void): grpc.ClientUnaryCall;
    public onBindingEvent(request: dapr_proto_runtime_v1_appcallback_pb.BindingEventRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_appcallback_pb.BindingEventResponse) => void): grpc.ClientUnaryCall;
    public onBindingEvent(request: dapr_proto_runtime_v1_appcallback_pb.BindingEventRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: dapr_proto_runtime_v1_appcallback_pb.BindingEventResponse) => void): grpc.ClientUnaryCall;
}
