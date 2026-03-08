#include "request.h"
#include <stdio.h>
#include <string.h>

int read_word(char* text, int max_size, char word[max_size]);

int read_from_chars(char* request_chars, HttpRequest* request, HttpParseError* error)
{
    if (request_chars == NULL || request_chars[0] == '\0') {
        *error = EMPTY;
        return -1;
    }

    int curr_rc_index = 0;
    char method[8];
    int method_size = read_word(request_chars, 8, method);
    if (method_size == -1 || strncmp(method, "POST", 5) != 0) {
        *error = REQ_LINE_MISSING_METHOD;
        return -1;
    }

    curr_rc_index += method_size;
    HttpRequest rq_stage = { 0 };
    strncpy(rq_stage.requestLine.method, method, 8);

    char target[129] = { 0 };
    char path_start = request_chars[curr_rc_index];
    if (path_start != '/') {
        *error = REQ_LINE_MISSING_TARGET;
        return -1;
    }
    target[0] = '/';
    curr_rc_index++;

    int target_size = read_word(request_chars+curr_rc_index, 128, target + 1);
    if (target_size == -1) {
        *error = REQ_LINE_MISSING_TARGET;
        return -1;
    }
    curr_rc_index += target_size;
    strncpy(rq_stage.requestLine.requestTarget, target, 129);

    char version[9] = { 0 };
    int version_size = read_word(request_chars+curr_rc_index, 9, version);
    printf("LOCAL_DEBUG: word: %s\n", version);
    if (version_size == -1 || strncmp(version, "HTTP/1.1", 9) != 0)
    {
        *error = REQ_LINE_MISSING_VERSION;
        return -1;
    }
    curr_rc_index += version_size;
    strncpy(rq_stage.requestLine.httpVersion, version, 9);

    return 0;
}

int read_word(char* text, int scan_range, char word[scan_range])
{
    int word_size = 0;
    for(int i=0; i<scan_range; i++){
        char buf = text[i];
        if (buf == '\0') {
            return -1;
        }
        word_size++;
        if (buf == ' ' || buf == '\r') {
            word[i] = '\0';
            break;
        }
        word[i] = buf;
    }

    return word_size;
}
