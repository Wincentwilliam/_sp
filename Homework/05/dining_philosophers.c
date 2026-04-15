/*
 * Dining Philosophers Problem - Deadlock Prevention with Resource Hierarchy
 * 
 * This program demonstrates:
 * - 5 philosophers (threads) sharing 5 chopsticks (mutexes)
 * - Deadlock prevention using Resource Hierarchy (ordered acquisition)
 * 
 * Why Resource Hierarchy works:
 * - Each philosopher picks up the LOWER numbered chopstick first
 * - This prevents Circular Wait (one of 4 conditions needed for deadlock)
 * 
 * Compile with: gcc -pthread -o dining_philosophers dining_philosophers.c
 */

#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <unistd.h>
#include <time.h>

#define NUM_PHILOSOPHERS 5

/* Chopsticks represented as mutexes */
pthread_mutex_t chopsticks[NUM_PHILOSOPHERS] = {
    PTHREAD_MUTEX_INITIALIZER,
    PTHREAD_MUTEX_INITIALIZER,
    PTHREAD_MUTEX_INITIALIZER,
    PTHREAD_MUTEX_INITIALIZER,
    PTHREAD_MUTEX_INITIALIZER
};

/* ============================================================================
 * PHILOSOPHER THREAD
 * ============================================================================ */

void* philosopher(void* arg) {
    int id = *(int*)arg;
    int left = id;
    int right = (id + 1) % NUM_PHILOSOPHERS;
    
    /* Determine lower and higher numbered chopsticks for ordering */
    int first = (left < right) ? left : right;
    int second = (left < right) ? right : left;
    
    for (int meal = 0; meal < 3; meal++) {
        /* Thinking */
        printf("Philosopher %d is thinking (meal %d)...\n", id, meal + 1);
        usleep(rand() % 50000);
        
        /* Pick up chopsticks in order (lowest first) - DEADLOCK PREVENTION */
        printf("  -> Philosopher %d picks up chopstick %d\n", id, first);
        pthread_mutex_lock(&chopsticks[first]);
        
        printf("  -> Philosopher %d picks up chopstick %d\n", id, second);
        pthread_mutex_lock(&chopsticks[second]);
        
        /* Eating */
        printf("*** Philosopher %d is EATING (meal %d) ***\n", id, meal + 1);
        usleep(rand() % 50000);
        
        /* Put down chopsticks */
        pthread_mutex_unlock(&chopsticks[second]);
        pthread_mutex_unlock(&chopsticks[first]);
        
        printf("  <- Philosopher %d puts down chopsticks\n", id);
    }
    
    printf(">>> Philosopher %d finished all meals! <<<\n", id);
    return NULL;
}

/* ============================================================================
 * MAIN
 * ============================================================================ */

int main() {
    srand(time(NULL));
    
    printf("=================================================\n");
    printf("DINING PHILOSOPHERS PROBLEM\n");
    printf("=================================================\n");
    printf("Strategy: Resource Hierarchy (Ordered Acquisition)\n");
    printf("This prevents Circular Wait - no deadlock possible!\n\n");
    
    pthread_t philosophers[NUM_PHILOSOPHERS];
    int philosopher_ids[NUM_PHILOSOPHERS];
    
    /* Create philosopher threads */
    for (int i = 0; i < NUM_PHILOSOPHERS; i++) {
        philosopher_ids[i] = i;
        pthread_create(&philosophers[i], NULL, philosopher, &philosopher_ids[i]);
    }
    
    /* Wait for all philosophers to finish */
    for (int i = 0; i < NUM_PHILOSOPHERS; i++) {
        pthread_join(philosophers[i], NULL);
    }
    
    printf("\n=================================================\n");
    printf("All philosophers finished - No deadlock occurred!\n");
    printf("=================================================\n");
    
    return 0;
}