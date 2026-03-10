#ifdef TEST

#define TEST_ASSERT_STRUCT_ZEROED(s) TEST_ASSERT_EQUAL_MEMORY(&(s), &(typeof(s)) { 0 }, sizeof(s))

#include "request.h"
#include "unity.h"

void setUp(void)
{
}

void tearDown(void)
{
}

void test_readEmptyString_returnsNeg1(void)
{
    char* input = "";
    HttpRequest req = { 0 };
    HttpParseError err;

    int result = read_from_chars(input, &req, &err);

    TEST_ASSERT_EQUAL(-1, result);
    TEST_ASSERT_STRUCT_ZEROED(req);
    TEST_ASSERT_EQUAL(EMPTY, err);
}

void test_readInvalidRequestLine_ReturnsNeg1()
{
    char* input = "notvalid";
    HttpRequest req = { 0 };
    HttpParseError err;

    int result = read_from_chars(input, &req, &err);

    TEST_ASSERT_EQUAL(-1, result);
    TEST_ASSERT_STRUCT_ZEROED(req);
    TEST_ASSERT_EQUAL(REQ_LINE_MISSING_METHOD, err);
}

void test_readReqLineWithJustMethod_ReturnsNeg1()
{
    char* input = "POST ";
    HttpRequest req = { 0 };
    HttpParseError err;

    int result = read_from_chars(input, &req, &err);

    TEST_ASSERT_EQUAL(-1, result);
    TEST_ASSERT_STRUCT_ZEROED(req);
    TEST_ASSERT_EQUAL(REQ_LINE_MISSING_TARGET, err);
}

void test_readReqLineMissingHttpVersion_ReturnsNeg1()
{
    char* input = "POST / ";
    HttpRequest req = { 0 };
    HttpParseError err;

    int result = read_from_chars(input, &req, &err);

    TEST_ASSERT_EQUAL(-1, result);
    TEST_ASSERT_STRUCT_ZEROED(req);
    TEST_ASSERT_EQUAL(REQ_LINE_MISSING_VERSION, err);
}

void test_readReqLineBadVersion_ReturnsNeg1()
{
    char* input = "POST / BADVER";
    HttpRequest req = { 0 };
    HttpParseError err;

    int result = read_from_chars(input, &req, &err);

    TEST_ASSERT_EQUAL(-1, result);
    TEST_ASSERT_STRUCT_ZEROED(req);
    TEST_ASSERT_EQUAL(REQ_LINE_MISSING_VERSION, err);
}

void test_readReqLineNotTerminated_ReturnsNeg1()
{
    char* input = "POST / HTTP/1.1";
    HttpRequest req = { 0 };
    HttpParseError err;

    int result = read_from_chars(input, &req, &err);

    TEST_ASSERT_EQUAL(-1, result);
    TEST_ASSERT_STRUCT_ZEROED(req);
    TEST_ASSERT_EQUAL(REQ_LINE_NOT_TERMINATED, err);
}

void test_readReqHasNoHeaders_ReturnsNeg1()
{
    char* input = "POST / HTTP/1.1\r\n";
    HttpRequest req = { 0 };
    HttpParseError err;

    int result = read_from_chars(input, &req, &err);

    TEST_ASSERT_EQUAL(-1, result);
    TEST_ASSERT_STRUCT_ZEROED(req);
    TEST_ASSERT_EQUAL(REQ_HAS_MALFORMED_HEADERS, err);
}

void test_readReqHeaderBadKey_ReturnsNeg1()
{
    char* input = "POST / HTTP/1.1\r\n"
                  "Key Value\r\n\r\n";
    HttpRequest req = { 0 };
    HttpParseError err;

    int result = read_from_chars(input, &req, &err);

    TEST_ASSERT_EQUAL(-1, result);
    TEST_ASSERT_STRUCT_ZEROED(req);
    TEST_ASSERT_EQUAL(REQ_HAS_MALFORMED_HEADERS, err);
}

void test_readReqHeaderNoTerm_ReturnsNeg1()
{
    char* input = "POST / HTTP/1.1\r\n"
                  "Key: Value";
    HttpRequest req = { 0 };
    HttpParseError err;

    int result = read_from_chars(input, &req, &err);

    TEST_ASSERT_EQUAL(-1, result);
    TEST_ASSERT_STRUCT_ZEROED(req);
    TEST_ASSERT_EQUAL(REQ_HAS_MALFORMED_HEADERS, err);
}

void test_readReqHasNoReqTerm_ReturnsNeg1()
{
    char* input = "POST / HTTP/1.1\r\n"
                  "Key: Value\r\n";
    HttpRequest req = { 0 };
    HttpParseError err;

    int result = read_from_chars(input, &req, &err);

    TEST_ASSERT_EQUAL(-1, result);
    TEST_ASSERT_STRUCT_ZEROED(req);
    TEST_ASSERT_EQUAL(REQ_NOT_TERMINATED, err);
}

// void test_readReqHasValidAndInvalidHeader_ReturnsNeg1()
// {
//     char* input = "POST / HTTP/1.1\r\n"
//                   "Key: Value\r\n"
//                   "KeyWithNoColon Value\r\n\r\n";
//     HttpRequest req = { 0 };
//     HttpParseError err;
//
//     int result = read_from_chars(input, &req, &err);
//
//     TEST_ASSERT_EQUAL(-1, result);
//     TEST_ASSERT_STRUCT_ZEROED(req);
//     TEST_ASSERT_EQUAL(REQ_HAS_MALFORMED_HEADERS, err);
// }

void test_readValidHttpRequest_returnSuccess(void)
{
    char* input = "POST / HTTP/1.1\r\n"
                  "Key: Value\r\n\r\n";
    HttpRequest req = { 0 };
    HttpParseError err;

    int result = read_from_chars(input, &req, &err);

    TEST_ASSERT_EQUAL(0, result);
    TEST_ASSERT_EQUAL_STRING("POST", req.requestLine.method);
    TEST_ASSERT_EQUAL_STRING("/", req.requestLine.requestTarget);
    TEST_ASSERT_EQUAL_STRING("HTTP/1.1", req.requestLine.httpVersion);
    TEST_ASSERT_NOT_NULL(req.headerLines);
    TEST_ASSERT_EQUAL_STRING("Key", req.headerLines[0].key);
    TEST_ASSERT_EQUAL_STRING("Value", req.headerLines[0].value);
}

#endif // TEST
