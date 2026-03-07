#ifndef REQUEST_H
#define REQUEST_H

typedef struct {
    char *key;
    char *value;
} Header;

typedef struct {
    char *httpVersion;
    char *requestTarget;
    char *method;
} RequestLine;

typedef struct {
    RequestLine requestLine;
    Header *headerLines;
} HttpRequest;

int read_from_chars(char *chars, HttpRequest *request);
#endif // REQUEST_H
