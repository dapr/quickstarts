// GENERATED CODE -- DO NOT EDIT!

// Original file comments:
// ------------------------------------------------------------
// Copyright (c) Microsoft Corporation and Dapr Contributors.
// Licensed under the MIT License.
// ------------------------------------------------------------
//
'use strict';
var grpc = require('@grpc/grpc-js');
var dapr_proto_runtime_v1_appcallback_pb = require('../../../../dapr/proto/runtime/v1/appcallback_pb.js');
var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js');
var dapr_proto_common_v1_common_pb = require('../../../../dapr/proto/common/v1/common_pb.js');

function serialize_dapr_proto_common_v1_InvokeRequest(arg) {
  if (!(arg instanceof dapr_proto_common_v1_common_pb.InvokeRequest)) {
    throw new Error('Expected argument of type dapr.proto.common.v1.InvokeRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_dapr_proto_common_v1_InvokeRequest(buffer_arg) {
  return dapr_proto_common_v1_common_pb.InvokeRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_dapr_proto_common_v1_InvokeResponse(arg) {
  if (!(arg instanceof dapr_proto_common_v1_common_pb.InvokeResponse)) {
    throw new Error('Expected argument of type dapr.proto.common.v1.InvokeResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_dapr_proto_common_v1_InvokeResponse(buffer_arg) {
  return dapr_proto_common_v1_common_pb.InvokeResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_dapr_proto_runtime_v1_BindingEventRequest(arg) {
  if (!(arg instanceof dapr_proto_runtime_v1_appcallback_pb.BindingEventRequest)) {
    throw new Error('Expected argument of type dapr.proto.runtime.v1.BindingEventRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_dapr_proto_runtime_v1_BindingEventRequest(buffer_arg) {
  return dapr_proto_runtime_v1_appcallback_pb.BindingEventRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_dapr_proto_runtime_v1_BindingEventResponse(arg) {
  if (!(arg instanceof dapr_proto_runtime_v1_appcallback_pb.BindingEventResponse)) {
    throw new Error('Expected argument of type dapr.proto.runtime.v1.BindingEventResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_dapr_proto_runtime_v1_BindingEventResponse(buffer_arg) {
  return dapr_proto_runtime_v1_appcallback_pb.BindingEventResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_dapr_proto_runtime_v1_ListInputBindingsResponse(arg) {
  if (!(arg instanceof dapr_proto_runtime_v1_appcallback_pb.ListInputBindingsResponse)) {
    throw new Error('Expected argument of type dapr.proto.runtime.v1.ListInputBindingsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_dapr_proto_runtime_v1_ListInputBindingsResponse(buffer_arg) {
  return dapr_proto_runtime_v1_appcallback_pb.ListInputBindingsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_dapr_proto_runtime_v1_ListTopicSubscriptionsResponse(arg) {
  if (!(arg instanceof dapr_proto_runtime_v1_appcallback_pb.ListTopicSubscriptionsResponse)) {
    throw new Error('Expected argument of type dapr.proto.runtime.v1.ListTopicSubscriptionsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_dapr_proto_runtime_v1_ListTopicSubscriptionsResponse(buffer_arg) {
  return dapr_proto_runtime_v1_appcallback_pb.ListTopicSubscriptionsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_dapr_proto_runtime_v1_TopicEventRequest(arg) {
  if (!(arg instanceof dapr_proto_runtime_v1_appcallback_pb.TopicEventRequest)) {
    throw new Error('Expected argument of type dapr.proto.runtime.v1.TopicEventRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_dapr_proto_runtime_v1_TopicEventRequest(buffer_arg) {
  return dapr_proto_runtime_v1_appcallback_pb.TopicEventRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_dapr_proto_runtime_v1_TopicEventResponse(arg) {
  if (!(arg instanceof dapr_proto_runtime_v1_appcallback_pb.TopicEventResponse)) {
    throw new Error('Expected argument of type dapr.proto.runtime.v1.TopicEventResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_dapr_proto_runtime_v1_TopicEventResponse(buffer_arg) {
  return dapr_proto_runtime_v1_appcallback_pb.TopicEventResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_google_protobuf_Empty(arg) {
  if (!(arg instanceof google_protobuf_empty_pb.Empty)) {
    throw new Error('Expected argument of type google.protobuf.Empty');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_google_protobuf_Empty(buffer_arg) {
  return google_protobuf_empty_pb.Empty.deserializeBinary(new Uint8Array(buffer_arg));
}


// AppCallback V1 allows user application to interact with Dapr runtime.
// User application needs to implement AppCallback service if it needs to
// receive message from dapr runtime.
var AppCallbackService = exports.AppCallbackService = {
  // Invokes service method with InvokeRequest.
onInvoke: {
    path: '/dapr.proto.runtime.v1.AppCallback/OnInvoke',
    requestStream: false,
    responseStream: false,
    requestType: dapr_proto_common_v1_common_pb.InvokeRequest,
    responseType: dapr_proto_common_v1_common_pb.InvokeResponse,
    requestSerialize: serialize_dapr_proto_common_v1_InvokeRequest,
    requestDeserialize: deserialize_dapr_proto_common_v1_InvokeRequest,
    responseSerialize: serialize_dapr_proto_common_v1_InvokeResponse,
    responseDeserialize: deserialize_dapr_proto_common_v1_InvokeResponse,
  },
  // Lists all topics subscribed by this app.
listTopicSubscriptions: {
    path: '/dapr.proto.runtime.v1.AppCallback/ListTopicSubscriptions',
    requestStream: false,
    responseStream: false,
    requestType: google_protobuf_empty_pb.Empty,
    responseType: dapr_proto_runtime_v1_appcallback_pb.ListTopicSubscriptionsResponse,
    requestSerialize: serialize_google_protobuf_Empty,
    requestDeserialize: deserialize_google_protobuf_Empty,
    responseSerialize: serialize_dapr_proto_runtime_v1_ListTopicSubscriptionsResponse,
    responseDeserialize: deserialize_dapr_proto_runtime_v1_ListTopicSubscriptionsResponse,
  },
  // Subscribes events from Pubsub
onTopicEvent: {
    path: '/dapr.proto.runtime.v1.AppCallback/OnTopicEvent',
    requestStream: false,
    responseStream: false,
    requestType: dapr_proto_runtime_v1_appcallback_pb.TopicEventRequest,
    responseType: dapr_proto_runtime_v1_appcallback_pb.TopicEventResponse,
    requestSerialize: serialize_dapr_proto_runtime_v1_TopicEventRequest,
    requestDeserialize: deserialize_dapr_proto_runtime_v1_TopicEventRequest,
    responseSerialize: serialize_dapr_proto_runtime_v1_TopicEventResponse,
    responseDeserialize: deserialize_dapr_proto_runtime_v1_TopicEventResponse,
  },
  // Lists all input bindings subscribed by this app.
listInputBindings: {
    path: '/dapr.proto.runtime.v1.AppCallback/ListInputBindings',
    requestStream: false,
    responseStream: false,
    requestType: google_protobuf_empty_pb.Empty,
    responseType: dapr_proto_runtime_v1_appcallback_pb.ListInputBindingsResponse,
    requestSerialize: serialize_google_protobuf_Empty,
    requestDeserialize: deserialize_google_protobuf_Empty,
    responseSerialize: serialize_dapr_proto_runtime_v1_ListInputBindingsResponse,
    responseDeserialize: deserialize_dapr_proto_runtime_v1_ListInputBindingsResponse,
  },
  // Listens events from the input bindings
//
// User application can save the states or send the events to the output
// bindings optionally by returning BindingEventResponse.
onBindingEvent: {
    path: '/dapr.proto.runtime.v1.AppCallback/OnBindingEvent',
    requestStream: false,
    responseStream: false,
    requestType: dapr_proto_runtime_v1_appcallback_pb.BindingEventRequest,
    responseType: dapr_proto_runtime_v1_appcallback_pb.BindingEventResponse,
    requestSerialize: serialize_dapr_proto_runtime_v1_BindingEventRequest,
    requestDeserialize: deserialize_dapr_proto_runtime_v1_BindingEventRequest,
    responseSerialize: serialize_dapr_proto_runtime_v1_BindingEventResponse,
    responseDeserialize: deserialize_dapr_proto_runtime_v1_BindingEventResponse,
  },
};

exports.AppCallbackClient = grpc.makeGenericClientConstructor(AppCallbackService);
