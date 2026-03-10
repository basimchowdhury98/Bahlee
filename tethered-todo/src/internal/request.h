#ifndef REQUEST_H
#define REQUEST_H

#define MAX_METHOD 7
#define MAX_WORD_LENGTH 64
#define MAX_HTTP_VERSION 8
#define LINE_TERM "\r\n"

typedef struct {
    char key[MAX_WORD_LENGTH+1];
    char value[MAX_WORD_LENGTH+1];
} Header;

typedef struct {
    char httpVersion[MAX_HTTP_VERSION + 1];
    char requestTarget[MAX_WORD_LENGTH + 1];
    char method[MAX_METHOD + 1];
} RequestLine;

typedef struct {
    RequestLine requestLine;
    Header* headerLines;
} HttpRequest;

typedef enum {
    EMPTY,
    REQ_LINE_MISSING_METHOD,
    REQ_LINE_MISSING_TARGET,
    REQ_LINE_MISSING_VERSION,
    REQ_LINE_NOT_TERMINATED,
    REQ_HAS_MALFORMED_HEADERS,
    REQ_NOT_TERMINATED
} HttpParseError;

int read_from_chars(char* request_chars, HttpRequest* request, HttpParseError* error);
#endif // REQUEST_H
