
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

struct HttpRequest {
    RequestLine requestLine;
    Header *headerLines;
};

struct HttpRequest read_from_chars(char *chars);
#endif // REQUEST_H
