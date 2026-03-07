.PHONY: build run test
CC = gcc
CFLAGS = -Wall -Wextra

build:
	$(CC) $(CFLAGS) -o output/server src/main.c

run: build
	./output/server

test: build
	ceedling test:all
