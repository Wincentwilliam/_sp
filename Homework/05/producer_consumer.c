/*
 * Producer-Consumer Problem - Bounded Buffer with Mutex and Condition Variables
 * 
 * This program demonstrates:
 * - Multiple producers adding items to a shared buffer
 * - Multiple consumers removing items from the buffer
 * - pthread_mutex_t for mutual exclusion
 * - pthread_cond_t for thread signaling (not full / not empty)
 * 
 * Buffer size: 10
 * Compile with: gcc -pthread -o producer_consumer producer_consumer.c
 */

#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <unistd.h>
#include <time.h>

#define BUFFER_SIZE 10

/* Shared buffer */
int buffer[BUFFER_SIZE];

/* Buffer indices */
int in = 0;
int out = 0;
int count = 0;

/* Synchronization primitives */
pthread_mutex_t buffer_mutex = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t not_full = PTHREAD_COND_INITIALIZER;
pthread_cond_t not_empty = PTHREAD_COND_INITIALIZER;

#define NUM_PRODUCERS 3
#define NUM_CONSUMERS 3
#define ITEMS_PER_PRODUCER 20

/* ============================================================================
 * PRODUCER THREAD
 * ============================================================================ */

void* producer(void* arg) {
    int id = *(int*)arg;
    
    for (int i = 0; i < ITEMS_PER_PRODUCER; i++) {
        /* Lock mutex before accessing shared buffer */
        pthread_mutex_lock(&buffer_mutex);
        
        /* Wait until buffer has space */
        while (count == BUFFER_SIZE) {
            pthread_cond_wait(&not_full, &buffer_mutex);
        }
        
        /* Produce item */
        buffer[in] = i * 100 + id;
        printf("Producer %d produced: %d\n", id, buffer[in]);
        in = (in + 1) % BUFFER_SIZE;
        count++;
        
        /* Signal consumers that buffer is not empty */
        pthread_cond_signal(&not_empty);
        
        pthread_mutex_unlock(&buffer_mutex);
        
        usleep(rand() % 1000);
    }
    
    return NULL;
}

/* ============================================================================
 * CONSUMER THREAD
 * ============================================================================ */

void* consumer(void* arg) {
    int id = *(int*)arg;
    
    for (int i = 0; i < ITEMS_PER_PRODUCER * NUM_PRODUCERS / NUM_CONSUMERS; i++) {
        /* Lock mutex before accessing shared buffer */
        pthread_mutex_lock(&buffer_mutex);
        
        /* Wait until buffer has items */
        while (count == 0) {
            pthread_cond_wait(&not_empty, &buffer_mutex);
        }
        
        /* Consume item */
        int item = buffer[out];
        printf("Consumer %d consumed: %d\n", id, item);
        out = (out + 1) % BUFFER_SIZE;
        count--;
        
        /* Signal producers that buffer is not full */
        pthread_cond_signal(&not_full);
        
        pthread_mutex_unlock(&buffer_mutex);
        
        usleep(rand() % 1000);
    }
    
    return NULL;
}

/* ============================================================================
 * MAIN
 * ============================================================================ */

int main() {
    srand(time(NULL));
    
    printf("=================================================\n");
    printf("PRODUCER-CONSUMER PROBLEM\n");
    printf("=================================================\n");
    printf("Buffer size: %d\n", BUFFER_SIZE);
    printf("Producers: %d | Consumers: %d\n", NUM_PRODUCERS, NUM_CONSUMERS);
    printf("Items per producer: %d\n\n", ITEMS_PER_PRODUCER);
    
    pthread_t producers[NUM_PRODUCERS];
    pthread_t consumers[NUM_CONSUMERS];
    int producer_ids[NUM_PRODUCERS];
    int consumer_ids[NUM_CONSUMERS];
    
    in = 0;
    out = 0;
    count = 0;
    
    /* Create producer threads */
    for (int i = 0; i < NUM_PRODUCERS; i++) {
        producer_ids[i] = i + 1;
        pthread_create(&producers[i], NULL, producer, &producer_ids[i]);
    }
    
    /* Create consumer threads */
    for (int i = 0; i < NUM_CONSUMERS; i++) {
        consumer_ids[i] = i + 1;
        pthread_create(&consumers[i], NULL, consumer, &consumer_ids[i]);
    }
    
    /* Wait for all producers */
    for (int i = 0; i < NUM_PRODUCERS; i++) {
        pthread_join(producers[i], NULL);
    }
    
    /* Wait for all consumers */
    for (int i = 0; i < NUM_CONSUMERS; i++) {
        pthread_join(consumers[i], NULL);
    }
    
    printf("\n=================================================\n");
    printf("Producer-Consumer completed successfully!\n");
    printf("No buffer overflow or underflow occurred.\n");
    printf("=================================================\n");
    
    return 0;
}