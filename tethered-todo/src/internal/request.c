#include "request.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int read_from_chars(char *chars, HttpRequest *request)
{
    if (chars == NULL || chars[0] == '\0')
    {
        printf("LOCAL_DEBUG: here\n");
        return -1;
    }

    char method[4];
    for (int i = 0;i < 4; i ++)
    {
        char buf = chars[i];
        if (buf == '\0')
        {
            return -1;
        }
        method[i] = buf;
    }

    if (strncmp(method, "POST", 4) != 0) {
        return -1;
    }

    return 0;
}
