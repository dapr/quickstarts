package com.service.controller;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Base64;
import java.util.Map;

public class HttpBindingResponse {

    private final String data; // Base64 string
    private final Map<String, String> metadata;

    @JsonCreator
    public HttpBindingResponse(
            @JsonProperty("data") String data,
            @JsonProperty("metadata") Map<String, String> metadata) {
        this.data = data;
        this.metadata = metadata;
    }

    public String getData() {
        return data;
    }

    public byte[] getDecodedData() {
        return Base64.getDecoder().decode(data);
    }

    public Map<String, String> getMetadata() {
        return metadata;
    }

    @Override
    public String toString() {
        return "HttpBindingResponse{" +
                "data(Base64)='" + data + '\'' +
                ", metadata=" + metadata +
                '}';
    }
}