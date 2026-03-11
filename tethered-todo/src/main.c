#include "request.h"
#include <asm-generic/socket.h>
#include <netinet/in.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/socket.h>
#include <unistd.h>

int main()
{
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd == -1) {
        perror("Socket failed\n");
        return -1;
    }
    int opt = 1;
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    printf("Socket made\n");

    struct sockaddr_in addr;
    addr.sin_family = AF_INET;
    addr.sin_port = htons(9090);
    addr.sin_addr.s_addr = INADDR_ANY;

    int bind_r = bind(server_fd, (struct sockaddr*)&addr, sizeof(addr));
    if (bind_r == -1) {
        perror("Socket bind failed\n");
        return -1;
    }
    printf("Socket bind made\n");

    int listen_r = listen(server_fd, 1);
    if (listen_r == -1) {
        perror("Socket listen failed\n");
        return -1;
    }
    printf("Socket listen made\n");

    while (1) {
        struct sockaddr accept_addr;
        socklen_t accept_addr_len = sizeof(accept_addr);

        int accept_fd = accept(server_fd, &accept_addr, &accept_addr_len);
        if (accept_fd == -1) {
            continue;
        }

        int scan_range = 64;
        int buff_size = scan_range;
        char* buff = malloc(buff_size + 1);
        ssize_t len = 0;
        int running_size = 0;
        printf("Reading message...\n");
        do {
            if (running_size >= buff_size) {
                buff_size *= 2;
                buff = realloc(buff, buff_size);
                if (buff == NULL) {
                    perror("Something went wrong \n");
                    close(accept_fd);
                    free(buff);
                    break;
                }
            }
            len = read(accept_fd, buff + running_size, scan_range);
            if (len == -1) {
                perror("Socket read failure\n");
                close(accept_fd);
                free(buff);
                break;
            }
            running_size += len;
        } while (len >= scan_range);

        if (running_size == buff_size) {
            buff_size *= 2;
            buff = realloc(buff, buff_size);
        }
        buff[running_size] = '\0';

        HttpRequest request = { 0 };
        HttpParseError err;
        int parse_res = read_from_chars(buff, &request, &err);

        if (parse_res == 0) {
            printf("Method: %s\n", request.requestLine.method);
            printf("Target: %s\n", request.requestLine.requestTarget);
            printf("Version: %s\n", request.requestLine.httpVersion);
            for (int i = 0; i < request.headerCount; i++) {
                printf("Header: %s: %s\n", request.headerLines[i].key, request.headerLines[i].value);
            }
        } else {
            printf("Parse error: %d\n", err);
        }

        close(accept_fd);
        free(buff);
    }
}
