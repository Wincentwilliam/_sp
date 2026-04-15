# Linux Multi-Threading Assignment

---

## Section 1: Theoretical Concepts Documentation

### 1. Thread

A **thread** is the smallest unit of execution within a process. In Linux, threads share the same address space, code segment, data segment, and open files of their parent process, but each thread maintains its own:
- Stack (local variables, return addresses)
- Program counter (instruction pointer)
- Register set
- Thread-specific data

Threads within the same process can communicate directly through shared memory, making inter-thread communication efficient. In Linux, threads are implemented using the POSIX threads (`pthread`) standard, where the kernel treats each thread as a lightweight process (LWP) with its own task_struct, but they share certain resources.

### 2. Race Condition

A **race condition** occurs when multiple threads access and modify shared data concurrently, and the final outcome depends on the relative timing of thread execution. The critical issue is that the operating system may interleave the operations of different threads in unpredictable ways.

In the context of a Linux process, a race condition typically arises when:
1. Multiple threads read from a shared variable
2. At least one thread modifies that variable
3. The timing of these operations determines the final value

**Example:** If two threads both execute `counter = counter + 1`, the operations may interleave as:
- Thread A reads counter (value = 5)
- Thread B reads counter (value = 5)
- Thread A writes 6
- Thread B writes 6

Result: counter = 6 instead of 7 (one increment lost)

Race conditions violate the expected behavior and lead to data corruption or inconsistent state.

### 3. Mutex (Mutual Exclusion)

A **mutex** is a synchronization primitive that provides mutual exclusion to protect shared resources from concurrent access. In Linux (pthreads), `pthread_mutex_t` enforces that only one thread can hold the mutex at any given time.

The mutex operates with three primary states:
- **Unlocked**: Available for acquisition
- **Locked**: Held by a thread
- **Contended**: Other threads are waiting to acquire

**How it works:**
1. A thread calls `pthread_mutex_lock()` to acquire the mutex
2. If unlocked, the thread acquires it and proceeds
3. If locked, the thread blocks (is put to sleep) until the owner calls `pthread_mutex_unlock()`
4. Upon unlock, one waiting thread is awakened to acquire the mutex

Mutexes ensure **atomicity** of critical sections—sequences of operations that must execute as a single, uninterruptible unit.

### 4. Deadlock

A **deadlock** is a state where two or more threads are permanently blocked, each waiting for a resource held by another. No thread can proceed because they are all waiting for each other to release a lock.

**Four necessary conditions for deadlock** (Coffman conditions):
1. **Mutual Exclusion**: At least one resource is non-sharable
2. **Hold and Wait**: Threads hold resources while waiting for others
3. **No Preemption**: Resources cannot be forcibly taken from threads
4. **Circular Wait**: A circular chain of threads exists, each waiting for a resource held by the next

**How they relate:**

```
Thread <---> Race Condition <---> Mutex
           (problem)        (solution)
                |
                v
           Deadlock
     (overuse of mutexes,
      creating circular waits)
```

- **Thread** is the entity that can cause or suffer from race conditions
- **Race Condition** is the problem when threads improperly access shared data
- **Mutex** is the primary solution to prevent race conditions
- **Deadlock** is a potential side effect when mutexes are used incorrectly (e.g., multiple mutexes acquired in different orders)

In Linux, the scheduler determines which thread runs when, making race conditions possible and deadlock a real risk when proper synchronization is not designed carefully.

---

## Section 2: Coding Implementations

### File Structure

The implementation is split into three separate C files:

| File | Description |
|------|-------------|
| `bank_simulation.c` | Demonstrates race condition and mutex solution |
| `producer_consumer.c` | Bounded buffer with condition variables |
| `dining_philosophers.c` | Deadlock prevention using resource hierarchy |

---

### 1. Bank Simulation (`bank_simulation.c`)

**Problem:** Two threads (depositor and withdrawer) perform 100,000 operations each on a shared balance.

**Key Concepts:**
- **Race Condition**: Without mutex, the read-modify-write operation is not atomic, causing lost updates
- **Mutex Solution**: Using `pthread_mutex_t` ensures only one thread can access the balance at a time

**Expected Result:** 
- Initial: 50,000
- 100,000 deposits + 100,000 withdrawals = 50,000

**Unsafe Version:** Result varies (e.g., 503, -10050) due to lost updates
**Safe Version:** Always exactly 50,000 with mutex protection

---

### 2. Producer-Consumer Problem (`producer_consumer.c`)

**Problem:** Multiple producers add items to a bounded buffer (size 10), multiple consumers remove items.

**Key Concepts:**
- **Mutex**: Protects access to shared buffer
- **Condition Variables**: 
  - `not_full`: Producers wait when buffer is full
  - `not_empty`: Consumers wait when buffer is empty

**Synchronization Logic:**
```c
// Producer
pthread_mutex_lock(&buffer_mutex);
while (count == BUFFER_SIZE) 
    pthread_cond_wait(&not_full, &buffer_mutex);
// produce item
pthread_cond_signal(&not_empty);
pthread_mutex_unlock(&buffer_mutex);

// Consumer
pthread_mutex_lock(&buffer_mutex);
while (count == 0) 
    pthread_cond_wait(&not_empty, &buffer_mutex);
// consume item
pthread_cond_signal(&not_full);
pthread_mutex_unlock(&buffer_mutex);
```

---

### 3. Dining Philosophers Problem (`dining_philosophers.c`)

**Problem:** 5 philosophers (threads) need 5 chopsticks (mutexes) to eat. Each philosopher needs two chopsticks.

**Key Concepts:**
- **Deadlock Prevention**: Using Resource Hierarchy (ordered acquisition)
- Strategy: Each philosopher picks up the **lower-numbered chopstick first**

**Why it works:**
- Eliminates Circular Wait (one of 4 deadlock conditions)
- Wait chain always goes from lower to higher chopstick numbers
- No circular dependency can form

```c
int first = (left < right) ? left : right;   // Lower numbered
int second = (left < right) ? right : left; // Higher numbered

pthread_mutex_lock(&chopsticks[first]);   // Always pick lower first
pthread_mutex_lock(&chopsticks[second]);
```

---

## Section 3: Implementation Technical Report

### 1. How pthread_mutex_t Ensures Atomicity

The mutex creates a **critical section** - a region of code that only one thread can execute at a time:

```c
pthread_mutex_lock(&mutex);
// Only one thread can be here at a time
shared_variable += 1;  // Atomic operation
pthread_mutex_unlock(&mutex);
```

When a thread enters the critical section:
1. Other threads attempting to enter are blocked (put to sleep)
2. The operations inside execute without interruption
3. On exit, one waiting thread is awakened

This transforms a non-atomic sequence (read → modify → write) into an atomic operation.

### 2. Role of pthread_cond_t in Producer-Consumer

Condition variables enable **efficient waiting** without busy-wasting CPU:

- **not_full**: Producers wait here when buffer is full
- **not_empty**: Consumers wait here when buffer is empty

**Why both mutex and condition variable?**
- The mutex ensures exclusive access to the buffer
- The condition variable allows threads to sleep while waiting for state changes

**Important:** The wait must be in a loop (not if) to handle spurious wakeups.

### 3. Deadlock Prevention Logic in Dining Philosophers

**The 4 Coffman Conditions for Deadlock:**
1. Mutual Exclusion - Only one thread can hold a chopstick
2. Hold and Wait - Philosophers hold chopsticks while waiting for others
3. No Preemption - Cannot forcibly take chopsticks
4. Circular Wait - Each philosopher waits for neighbor's chopstick

**How Resource Hierarchy breaks Circular Wait:**
- By enforcing "pick lower-numbered chopstick first"
- Philosopher 0 picks chopstick 0, then 1
- Philosopher 4 picks chopstick 0 first (but 0 < 4), then 4

The wait chain: Philosopher N waits for chopstick (N+1) → Philosopher (N+1)
This cannot form a cycle because chopstick 4 never waits for anything higher.

### 4. Why Synchronization Primitives Are Essential

In Linux, the scheduler can preempt any thread at any time. Without synchronization:

1. **Data Corruption**: Concurrent writes produce unpredictable results
2. **Visibility Issues**: Changes may not be visible to other threads (CPU caches)
3. **Atomicity Violations**: Multi-step operations get interleaved
4. **Deadlock**: Improper lock ordering causes permanent blocking

**Summary of Primitives Used:**
- **pthread_mutex_t**: Mutual exclusion for critical sections
- **pthread_cond_t**: Efficient thread signaling and waiting
- **pthread_create/pthread_join**: Thread lifecycle management

---

## Compilation and Execution

### Compile (use -pthread flag):
```bash
gcc -pthread -o bank_simulation bank_simulation.c
gcc -pthread -o producer_consumer producer_consumer.c
gcc -pthread -o dining_philosophers dining_philosophers.c
```

### Run:
```bash
./bank_simulation
./producer_consumer
./dining_philosophers
```

---

## Expected Output Examples

### Bank Simulation
```
Initial balance: 50000
Expected final balance: 50000
Actual final balance: 503         (unsafe - different each time)
                                   
Actual final balance: 50000        (safe - always correct)
Status: PASS - No race condition!
```

### Producer-Consumer
```
Producer 1 produced: 1
Consumer 1 consumed: 1
... (no buffer overflow/underflow)
```

### Dining Philosophers
```
Philosopher 0 picks up chopstick 0
Philosopher 0 picks up chopstick 1
Philosopher 0 is EATING
... (all finish - no deadlock)
```

---

**Note:** This code targets Linux POSIX threads. On Windows, you would need a POSIX emulation layer (like MSYS2) or Windows-specific threading APIs.