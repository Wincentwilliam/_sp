/*
 * Linux Multi-threading Assignment
 * Section 2: Coding Implementations
 * 
 * This file contains three implementations:
 * 1. Bank Simulation - Demonstrates race condition and mutex solution
 * 2. Producer-Consumer Problem - Bounded buffer with condition variables
 * 3. Dining Philosophers Problem - Deadlock prevention strategies
 * 
 * Compile with: gcc -pthread -o threading_assignment *.c
 */

#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <unistd.h>
#include <time.h>

/* ============================================================================
 * PART 1: BANK SIMULATION
 * Demonstrates race condition and its correction using mutex
 * ============================================================================ */

/* Global balance - shared resource between threads */
volatile long long balance = 0;

/* Mutex for thread-safe access to balance */
pthread_mutex_t balance_mutex = PTHREAD_MUTEX_INITIALIZER;

/* Number of operations each thread performs */
#define NUM_OPERATIONS 100000

/*
 * Depositor thread function - adds 1 to balance NUM_OPERATIONS times
 */
void* depositor(void* arg) {
    for (int i = 0; i < NUM_OPERATIONS; i++) {
        /* UNSAFE: This demonstrates the race condition */
        /* The read-modify-write operation is not atomic:
         * 1. Read current balance
         * 2. Add 1
         * 3. Write back to balance
         * If both threads do this simultaneously, some increments are lost */
        long long temp = balance;
        temp = temp + 1;
        balance = temp;
    }
    return NULL;
}

/*
 * Withdrawer thread function - subtracts 1 from balance NUM_OPERATIONS times
 */
void* withdrawer(void* arg) {
    for (int i = 0; i < NUM_OPERATIONS; i++) {
        /* UNSAFE: Same race condition as depositor */
        long long temp = balance;
        temp = temp - 1;
        balance = temp;
    }
    return NULL;
}

/*
 * Bank simulation demonstrating race condition
 * Expected final balance: 0 (100000 deposits - 100000 withdrawals)
 * Actual result: Often non-zero due to lost updates (race condition)
 */
void run_unsafe_bank_simulation() {
    printf("=== BANK SIMULATION (UNSAFE VERSION) ===\n");
    balance = 50000;
    
    pthread_t dep_thread, wit_thread;
    
    pthread_create(&dep_thread, NULL, depositor, NULL);
    pthread_create(&wit_thread, NULL, withdrawer, NULL);
    
    pthread_join(dep_thread, NULL);
    pthread_join(wit_thread, NULL);
    
    printf("Initial balance: 50000\n");
    printf("Expected final balance: 50000\n");
    printf("Actual final balance: %lld\n", balance);
    printf("Difference (lost updates): %lld\n", (long long)50000 - balance);
    printf("\n");
}

/* ========== SAFE VERSION WITH MUTEX ========== */

volatile long long safe_balance = 0;
pthread_mutex_t safe_balance_mutex = PTHREAD_MUTEX_INITIALIZER;

/*
 * Safe depositor thread - uses mutex to protect critical section
 */
void* safe_depositor(void* arg) {
    for (int i = 0; i < NUM_OPERATIONS; i++) {
        /* Lock mutex before accessing shared resource */
        pthread_mutex_lock(&safe_balance_mutex);
        safe_balance += 1;
        pthread_mutex_unlock(&safe_balance_mutex);
    }
    return NULL;
}

/*
 * Safe withdrawer thread - uses mutex to protect critical section
 */
void* safe_withdrawer(void* arg) {
    for (int i = 0; i < NUM_OPERATIONS; i++) {
        pthread_mutex_lock(&safe_balance_mutex);
        safe_balance -= 1;
        pthread_mutex_unlock(&safe_balance_mutex);
    }
    return NULL;
}

/*
 * Bank simulation with proper mutex synchronization
 * Result should always be exactly 50000 (50000 + 100000 - 100000)
 */
void run_safe_bank_simulation() {
    printf("=== BANK SIMULATION (SAFE VERSION WITH MUTEX) ===\n");
    safe_balance = 50000;  /* Start with 50000 instead of 0 */
    
    pthread_t dep_thread, wit_thread;
    
    pthread_create(&dep_thread, NULL, safe_depositor, NULL);
    pthread_create(&wit_thread, NULL, safe_withdrawer, NULL);
    
    pthread_join(dep_thread, NULL);
    pthread_join(wit_thread, NULL);
    
    printf("Initial balance: 50000\n");
    printf("Expected final balance: 50000\n");
    printf("Actual final balance: %lld\n", safe_balance);
    printf("Status: %s\n\n", safe_balance == 50000 ? "PASS - No race condition" : "FAIL");
}


/* ============================================================================
 * PART 2: PRODUCER-CONSUMER PROBLEM
 * Bounded buffer (size 10) using mutex and condition variables
 * ============================================================================ */

#define BUFFER_SIZE 10

/* Shared buffer */
int buffer[BUFFER_SIZE];

/* Buffer indices */
int in = 0;    /* Write position */
int out = 0;   /* Read position */
int count = 0; /* Number of items in buffer */

/* Synchronization primitives */
pthread_mutex_t buffer_mutex = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t not_full = PTHREAD_COND_INITIALIZER;  /* Buffer not full */
pthread_cond_t not_empty = PTHREAD_COND_INITIALIZER; /* Buffer not empty */

#define NUM_PRODUCERS 3
#define NUM_CONSUMERS 3
#define ITEMS_PER_PRODUCER 20

/*
 * Producer thread: adds items to buffer
 * Uses condition variables to wait when buffer is full
 */
void* producer(void* arg) {
    int id = *(int*)arg;
    
    for (int i = 0; i < ITEMS_PER_PRODUCER; i++) {
        pthread_mutex_lock(&buffer_mutex);
        
        /* Wait until buffer has space (not full) */
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
        
        /* Small delay to simulate work */
        usleep(rand() % 1000);
    }
    
    return NULL;
}

/*
 * Consumer thread: removes items from buffer
 * Uses condition variables to wait when buffer is empty
 */
void* consumer(void* arg) {
    int id = *(int*)arg;
    
    for (int i = 0; i < ITEMS_PER_PRODUCER * NUM_PRODUCERS / NUM_CONSUMERS; i++) {
        pthread_mutex_lock(&buffer_mutex);
        
        /* Wait until buffer has items (not empty) */
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

/*
 * Producer-Consumer demonstration
 * Multiple producers fill buffer, multiple consumers empty it
 * Buffer never overflows or underflows
 */
void run_producer_consumer() {
    printf("=== PRODUCER-CONSUMER PROBLEM ===\n");
    
    pthread_t producers[NUM_PRODUCERS];
    pthread_t consumers[NUM_CONSUMERS];
    int producer_ids[NUM_PRODUCERS];
    int consumer_ids[NUM_CONSUMERS];
    
    /* Initialize buffer state */
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
    
    /* Wait for all producers to complete */
    for (int i = 0; i < NUM_PRODUCERS; i++) {
        pthread_join(producers[i], NULL);
    }
    
    /* Wait for all consumers to complete */
    for (int i = 0; i < NUM_CONSUMERS; i++) {
        pthread_join(consumers[i], NULL);
    }
    
    printf("Producer-Consumer completed successfully!\n\n");
}


/* ============================================================================
 * PART 3: DINING PHILOSOPHERS PROBLEM
 * 5 philosophers, 5 chopsticks, deadlock prevention
 * ============================================================================ */

#define NUM_PHILOSOPHERS 5

/* Chopsticks (mutexes) - one for each chopstick */
pthread_mutex_t chopsticks[NUM_PHILOSOPHERS] = {
    PTHREAD_MUTEX_INITIALIZER,
    PTHREAD_MUTEX_INITIALIZER,
    PTHREAD_MUTEX_INITIALIZER,
    PTHREAD_MUTEX_INITIALIZER,
    PTHREAD_MUTEX_INITIALIZER
};

/*
 * Philosopher thread function
 * 
 * DEADLOCK PREVENTION STRATEGY: Resource Hierarchy (Ordering)
 * - Each philosopher picks up the lower-numbered chopstick first
 * - Then picks up the higher-numbered chopstick
 * - This prevents circular wait condition (one of the 4 necessary conditions)
 * 
 * Why this works:
 * - If philosopher 0 picks chopstick 0 first, philosopher 4 tries to pick 4 first
 * - No philosopher can hold a higher-numbered chopstick while waiting for a lower one
 * - Circular wait is impossible because the wait chain always goes from lower to higher
 */
void* philosopher(void* arg) {
    int id = *(int*)arg;
    int left = id;                    /* Left chopstick index */
    int right = (id + 1) % NUM_PHILOSOPHERS; /* Right chopstick index (wraps around) */
    
    /* Determine lower and higher numbered chopsticks for resource hierarchy */
    int first = (left < right) ? left : right;
    int second = (left < right) ? right : left;
    
    for (int meal = 0; meal < 3; meal++) {
        /* Thinking state */
        printf("Philosopher %d is thinking (meal %d)...\n", id, meal + 1);
        usleep(rand() % 50000);
        
        /* Pick up chopsticks in order (lowest first) - DEADLOCK PREVENTION */
        printf("Philosopher %d trying to pick up chopstick %d (first)...\n", id, first);
        pthread_mutex_lock(&chopsticks[first]);
        
        printf("Philosopher %d trying to pick up chopstick %d (second)...\n", id, second);
        pthread_mutex_lock(&chopsticks[second]);
        
        /* Eating state */
        printf("Philosopher %d is EATING (meal %d)...\n", id, meal + 1);
        usleep(rand() % 50000);
        
        /* Put down chopsticks (can be in any order when releasing) */
        pthread_mutex_unlock(&chopsticks[second]);
        pthread_mutex_unlock(&chopsticks[first]);
        
        printf("Philosopher %d put down chopsticks\n", id);
    }
    
    printf("Philosopher %d finished all meals!\n", id);
    return NULL;
}

/*
 * Dining Philosophers demonstration
 * Uses resource hierarchy (ordering) to prevent deadlock
 * 
 * Why this prevents deadlock:
 * - Deadlock requires 4 conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait
 * - By enforcing ordering (pick low-numbered first), we eliminate Circular Wait
 * - The wait chain always goes: philosopher N waits for chopstick N+1
 *   which goes to philosopher N+1, etc. But this can't form a cycle because
 *   the highest numbered chopstick (4) only waits for lower numbers
 */
void run_dining_philosophers() {
    printf("=== DINING PHILOSOPHERS PROBLEM ===\n");
    printf("Strategy: Resource Hierarchy (ordered chopstick acquisition)\n");
    printf("This prevents Circular Wait - one of 4 conditions for deadlock\n\n");
    
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
    
    printf("\nDining Philosophers completed successfully - No deadlock!\n\n");
}


/* ============================================================================
 * MAIN FUNCTION
 * ============================================================================ */

int main(int argc, char* argv[]) {
    /* Seed random number generator */
    srand(time(NULL));
    
    printf("=================================================\n");
    printf("LINUX MULTI-THREADING ASSIGNMENT\n");
    printf("=================================================\n\n");
    
    /* Part 1: Bank Simulation */
    run_unsafe_bank_simulation();
    run_safe_bank_simulation();
    
    /* Part 2: Producer-Consumer */
    run_producer_consumer();
    
    /* Part 3: Dining Philosophers */
    run_dining_philosophers();
    
    printf("=================================================\n");
    printf("ALL PROGRAMS COMPLETED SUCCESSFULLY\n");
    printf("=================================================\n");
    
    return 0;
}