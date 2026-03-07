.PHONY: build run test
CC = gcc
CFLAGS = -Wall -Wextra
INCLUDES = -Isrc -Isrc/internal
SRCS = $(wildcard src/*.c) $(wildcard src/internal/*.c)

build:
	$(CC) $(CFLAGS) $(INCLUDES) -o output/server $(SRCS)

run: build
	./output/server

test:
	ceedling test:all
