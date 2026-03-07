#ifdef TEST

#define TEST_ASSERT_STRUCT_ZEROED(s) TEST_ASSERT_EQUAL_MEMORY(&(s), &(typeof(s)){0}, sizeof(s))

#include "unity.h"
#include "request.h"

void setUp(void)
{
}

void tearDown(void)
{
}

void test_readEmptyString_returnsNeg1(void)
{
    char *input = "\0";
    HttpRequest req = {0};

    int result = read_from_chars(input, &req);

    TEST_ASSERT_EQUAL(-1, result);
    TEST_ASSERT_STRUCT_ZEROED(req);
}

void test_readNoValidRequestLine_returnsNeg1(void)
{
    char *input = "notvalid\0";
    HttpRequest req = {0};

    int result = read_from_chars(input, &req);

    TEST_ASSERT_EQUAL(-1, result);
    TEST_ASSERT_STRUCT_ZEROED(req);
}

void test_readValidHttpRequest_returnSuccess(void)
{
    char *input = 
        "POST / HTTP/1.1\r\n"
        "Key: Value\r\n\r\n\0";
    HttpRequest req = {0};

    int result = read_from_chars(input, &req);

    TEST_ASSERT_EQUAL(0, result);
    // TEST_ASSERT_EQUAL_STRING("POST", req.requestLine.method);
    // TEST_ASSERT_EQUAL_STRING("/", req.requestLine.requestTarget);
    // TEST_ASSERT_EQUAL_STRING("HTTP/1.1", req.requestLine.httpVersion);
    // TEST_ASSERT_NOT_NULL(req.headerLines);
    // TEST_ASSERT_EQUAL_STRING("Key", req.headerLines[0].key);
    // TEST_ASSERT_EQUAL_STRING("Value", req.headerLines[0].value);
}

#endif // TEST
