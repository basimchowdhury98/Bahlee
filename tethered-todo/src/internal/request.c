#include "request.h"
#include <string.h>

int read_line_term(char* text);
int read_word(char* text, int scan_range, char word[scan_range+1]);
int read_header(char* header_sec, Header* header);

int read_from_chars(char* request_chars, HttpRequest* request, HttpParseError* error)
{
    if (request_chars == NULL || request_chars[0] == '\0') {
        *error = EMPTY;
        return -1;
    }

    HttpRequest rq_stage = { 0 };
    int rc_pointer = 0;

    int method_size = read_word(request_chars, MAX_METHOD, rq_stage.requestLine.method);
    if (method_size == -1 || strncmp(rq_stage.requestLine.method, "POST", 5) != 0) {
        *error = REQ_LINE_MISSING_METHOD;
        return -1;
    }
    rq_stage.requestLine.method[method_size] = '\0';
    rc_pointer += method_size + 1;

    char target_start = request_chars[rc_pointer];
    if (target_start != '/') {
        *error = REQ_LINE_MISSING_TARGET;
        return -1;
    }
    rq_stage.requestLine.requestTarget[0] = '/';
    rc_pointer++;

    int target_size = read_word(request_chars + rc_pointer, MAX_WORD_LENGTH, rq_stage.requestLine.requestTarget + 1);
    if (target_size == -1) {
        *error = REQ_LINE_MISSING_TARGET;
        return -1;
    }
    rc_pointer += target_size + 1;
    rq_stage.requestLine.requestTarget[target_size + 1] = '\0';

    int version_size = read_word(request_chars + rc_pointer, MAX_HTTP_VERSION, rq_stage.requestLine.httpVersion);
    if (version_size == -1 || strncmp(rq_stage.requestLine.httpVersion, "HTTP/1.1", 8) != 0) {
        *error = REQ_LINE_MISSING_VERSION;
        return -1;
    }
    rc_pointer += version_size;
    rq_stage.requestLine.httpVersion[version_size] = '\0';

    int line_term_size = read_line_term(request_chars + rc_pointer);
    if (line_term_size == -1) {
        *error = REQ_LINE_NOT_TERMINATED;
        return -1;
    }
    rc_pointer += line_term_size;

    line_term_size = read_line_term(request_chars + rc_pointer);
    while (line_term_size == -1) {
        if (rq_stage.headerCount >= MAX_HEADERS) {
            *error = REQ_HAS_TOO_MANY_HEADERS;
            return -1;
        }

        Header header = { 0 };
        int header_size = read_header(request_chars + rc_pointer, &header);
        if (header_size == -1) {
            *error = REQ_HAS_MALFORMED_HEADERS;
            return -1;
        }
        rc_pointer += header_size;

        rq_stage.headerLines[rq_stage.headerCount] = header;
        rq_stage.headerCount++;
        line_term_size = read_line_term(request_chars + rc_pointer);
    }

    *request = rq_stage;
    return 0;
}

int read_header(char* header_sec, Header* header)
{
    Header header_stage = { 0 };
    char key_buf[MAX_WORD_LENGTH + 1] = { 0 };
    int header_key_size = read_word(header_sec, MAX_WORD_LENGTH + 1, key_buf);
    if (header_key_size == -1) {
        return -1;
    }
    if (key_buf[header_key_size - 1] != ':') {
        return -1;
    }
    strncpy(header_stage.key, key_buf, header_key_size - 1);
    header_stage.key[header_key_size - 1] = '\0';

    int header_index = header_key_size + 1;
    int header_val_size = read_word(header_sec + header_index, MAX_WORD_LENGTH, header_stage.value);
    if (header_val_size == -1) {
        return -1;
    }
    header_stage.value[header_val_size] = '\0';

    header_index += header_val_size;
    int header_term_size = read_line_term(header_sec + header_index);
    if (header_term_size == -1) {
        return -1;
    }
    header_index += header_term_size;

    *header = header_stage;
    return header_index;
}

int read_line_term(char* text)
{
    if (text[0] == '\0') {
        return -1;
    }
    char line_term[2];
    line_term[0] = text[0];
    if (text[1] == '\0') {
        return -1;
    }
    line_term[1] = text[1];
    if (strncmp(line_term, LINE_TERM, 2) != 0) {
        return -1;
    }

    return 2;
}

int read_word(char* text, int scan_range, char word[scan_range+1])
{
    int word_size = 0;
    for (int i = 0; i < scan_range; i++) {
        char buf = text[i];
        if (buf == '\0') {
            return -1;
        }
        if (buf == ' ' || buf == '\r') {
            break;
        }
        word_size++;
        word[i] = buf;
    }
    word[word_size] = '\0';

    return word_size;
}
