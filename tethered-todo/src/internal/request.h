#ifndef REQUEST_H
#define REQUEST_H

typedef struct {
    char *key;
    char *value;
} Header;

typedef struct {
    char httpVersion[9];
    char requestTarget[128];
    char method[8];
} RequestLine;

typedef struct {
    RequestLine requestLine;
    Header *headerLines;
} HttpRequest;

typedef enum {
    EMPTY,
    REQ_LINE_MISSING_METHOD,
    REQ_LINE_MISSING_TARGET,
    REQ_LINE_MISSING_VERSION
} HttpParseError;

int read_from_chars(char *request_chars, HttpRequest *request, HttpParseError *error);
#endif // REQUEST_H
