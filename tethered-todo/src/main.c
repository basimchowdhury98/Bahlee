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
        char* buff = malloc(9);
        ssize_t len = 0;
        printf("Reading message...\n");
        do {
            len = read(accept_fd, buff, 8);
            if (len == -1) {
                perror("Socket read failure\n");
                close(accept_fd);
                free(buff);
                break;
            }
            if (len == 0) {
                printf("End of message\n");
                continue;
            }

            buff[len] = '\0';
            printf("%s", buff);
            fflush(stdout);
        } while (len > 0);

        close(accept_fd);
        free(buff);
    }
}
