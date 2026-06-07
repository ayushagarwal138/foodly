package com.example.demo.exception;

import java.util.List;

public class ApiErrorResponse {
    private final ErrorBody error;
    private final String requestId;

    public ApiErrorResponse(String code, String message, List<String> details, String requestId) {
        this.error = new ErrorBody(code, message, details);
        this.requestId = requestId;
    }

    public ErrorBody getError() { return error; }
    public String getRequestId() { return requestId; }

    public static class ErrorBody {
        private final String code;
        private final String message;
        private final List<String> details;

        public ErrorBody(String code, String message, List<String> details) {
            this.code = code;
            this.message = message;
            this.details = details;
        }

        public String getCode() { return code; }
        public String getMessage() { return message; }
        public List<String> getDetails() { return details; }
    }
}
