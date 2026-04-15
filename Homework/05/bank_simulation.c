/*
 * Bank Simulation - Demonstrates Race Condition and Mutex Solution
 * 
 * This program shows:
 * 1. UNSAFE version: Race condition causes lost updates
 * 2. SAFE version: Mutex prevents race condition
 * 
 * Compile with: gcc -pthread -o bank_simulation bank_simulation.c
 */

#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <unistd.h>
#include <time.h>

#define NUM_OPERATIONS 100000

/* ============================================================================
 * UNSAFE VERSION - Demonstrates Race Condition
 * ============================================================================ */

volatile long long balance = 0;

void* depositor(void* arg) {
    for (int i = 0; i < NUM_OPERATIONS; i++) {
        long long temp = balance;
        temp = temp + 1;
        balance = temp;
    }
    return NULL;
}

void* withdrawer(void* arg) {
    for (int i = 0; i < NUM_OPERATIONS; i++) {
        long long temp = balance;
        temp = temp - 1;
        balance = temp;
    }
    return NULL;
}

void run_unsafe_bank() {
    printf("=== BANK SIMULATION (UNSAFE VERSION - RACE CONDITION) ===\n");
    printf("This version has NO mutex protection.\n");
    printf("Watch the 'Actual' number change every time you run it!\n\n");
    
    balance = 50000;
    
    pthread_t dep_thread, wit_thread;
    
    pthread_create(&dep_thread, NULL, depositor, NULL);
    pthread_create(&wit_thread, NULL, withdrawer, NULL);
    
    pthread_join(dep_thread, NULL);
    pthread_join(wit_thread, NULL);
    
    printf("Initial balance: 50000\n");
    printf("Expected final balance: 50000\n");
    printf("Actual final balance: %lld\n", balance);
    printf("Lost updates: %lld\n\n", (long long)50000 - balance);
}

/* ============================================================================
 * SAFE VERSION - With Mutex
 * ============================================================================ */

volatile long long safe_balance = 0;
pthread_mutex_t safe_balance_mutex = PTHREAD_MUTEX_INITIALIZER;

void* safe_depositor(void* arg) {
    for (int i = 0; i < NUM_OPERATIONS; i++) {
        pthread_mutex_lock(&safe_balance_mutex);
        safe_balance += 1;
        pthread_mutex_unlock(&safe_balance_mutex);
    }
    return NULL;
}

void* safe_withdrawer(void* arg) {
    for (int i = 0; i < NUM_OPERATIONS; i++) {
        pthread_mutex_lock(&safe_balance_mutex);
        safe_balance -= 1;
        pthread_mutex_unlock(&safe_balance_mutex);
    }
    return NULL;
}

void run_safe_bank() {
    printf("=== BANK SIMULATION (SAFE VERSION - WITH MUTEX) ===\n");
    printf("This version uses pthread_mutex to protect the balance.\n");
    printf("The result is ALWAYS correct!\n\n");
    
    safe_balance = 50000;
    
    pthread_t dep_thread, wit_thread;
    
    pthread_create(&dep_thread, NULL, safe_depositor, NULL);
    pthread_create(&wit_thread, NULL, safe_withdrawer, NULL);
    
    pthread_join(dep_thread, NULL);
    pthread_join(wit_thread, NULL);
    
    printf("Initial balance: 50000\n");
    printf("Expected final balance: 50000\n");
    printf("Actual final balance: %lld\n", safe_balance);
    printf("Status: %s\n\n", safe_balance == 50000 ? "PASS - No race condition!" : "FAIL");
}

/* ============================================================================
 * MAIN
 * ============================================================================ */

int main() {
    printf("=================================================\n");
    printf("BANK SIMULATION - Race Condition Demonstration\n");
    printf("=================================================\n\n");
    
    run_unsafe_bank();
    run_safe_bank();
    
    printf("=================================================\n");
    printf("Try running multiple times to see the difference!\n");
    printf("=================================================\n");
    
    return 0;
}