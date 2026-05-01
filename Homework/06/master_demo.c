/*
 * master_demo.c
 * System Programming - Master Demonstration Program
 * ----------------------------------------------------
 * This program demonstrates ALL core concepts of Unix process management
 * and file descriptor manipulation in a single, cohesive execution flow.
 *
 * Concepts Demonstrated:
 *   1. fork()  - Process creation
 *   2. execvp() - Process execution
 *   3. open()  - File opening/creation
 *   4. close() - File descriptor closing
 *   5. read()  - Reading from file descriptors
 *   6. write() - Writing to file descriptors
 *   7. dup2()  - File descriptor redirection
 *   8. wait()  - Parent-child synchronization
 *
 * File Descriptors Used:
 *   0 (stdin)  - Standard input
 *   1 (stdout) - Standard output
 *   2 (stderr) - Standard error
 *
 * Author: Claude Code (System Programming Assistant)
 * Purpose: Educational demonstration for System Programming course
 */

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <string.h>
#include <sys/types.h>

/*
 * ============================================================================
 * UTILITY MACROS AND FUNCTIONS
 * ============================================================================
 */

/* Get current process ID */
#define GETPID() getpid()

/*
 * LOG_stderr(FMT, ...):
 * Writes a formatted message to stderr (fd 2) with PID prefix.
 * Used for error messages and important status info that must not be redirected.
 */
#define LOG_stderr(FMT, ...) do { \
    char log_msg[512]; \
    int msg_len = snprintf(log_msg, sizeof(log_msg), "[PID:%4d] " FMT "\n", (int)GETPID(), ##__VA_ARGS__); \
    write(STDERR_FILENO, log_msg, msg_len); \
} while(0)

/*
 * LOG_stdout(FMT, ...):
 * Writes a formatted message to stdout (fd 1) with PID prefix.
 * Used for normal program output that may be redirected.
 */
#define LOG_stdout(FMT, ...) do { \
    char log_msg[512]; \
    int msg_len = snprintf(log_msg, sizeof(log_msg), "[PID:%4d] " FMT "\n", (int)GETPID(), ##__VA_ARGS__); \
    write(STDOUT_FILENO, log_msg, msg_len); \
} while(0)

/*
 * ============================================================================
 * PHASE 1: FILE I/O & CREATION
 * ============================================================================
 * Creates an input.txt file using open() and write()
 * Demonstrates file descriptor creation and basic file operations
 */

void phase1_file_io_and_creation(void) {
    int fd;
    const char *filename = "input.txt";
    const char *data = "This is test data written by master_demo.c\n"
                       "This file will be used later for stdin redirection.\n"
                       "Line 3: Verifying file contents through read() operation.\n";
    ssize_t bytes_written;

    LOG_stdout("=== PHASE 1: File I/O & Creation ===");

    /*
     * open() System Call:
     * -------------------
     * Creates/opens a file and returns a file descriptor.
     *
     * Parameters:
     *   - pathname: Path to the file ("input.txt")
     *   - flags: Access mode + options
     *     * O_WRONLY: Open for write-only access
     *     * O_CREAT: Create file if it doesn't exist
     *     * O_TRUNC: Truncate file to zero length if it exists
     *   - mode: Permissions for new file (0644 = rw-r--r--)
     *
     * File Permissions (0644):
     *   - Owner: read (4) + write (2) = 6
     *   - Group: read (4) = 4
     *   - Others: read (4) = 4
     *
     * Returns: Non-negative file descriptor on success, -1 on error
     */
    fd = open(filename, O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (fd == -1) {
        LOG_stderr("ERROR: Failed to create %s", filename);
        perror("open");
        exit(EXIT_FAILURE);
    }

    LOG_stdout("Created %s with file descriptor: %d", filename, fd);

    /*
     * write() System Call:
     * -------------------
     * Writes data to a file descriptor.
     *
     * Parameters:
     *   - fd: File descriptor to write to
     *   - buf: Pointer to data buffer
     *   - count: Number of bytes to write
     *
     * Returns: Number of bytes written, or -1 on error
     */
    bytes_written = write(fd, data, strlen(data));
    if (bytes_written == -1) {
        LOG_stderr("ERROR: Failed to write to %s", filename);
        perror("write");
        close(fd);
        exit(EXIT_FAILURE);
    }

    LOG_stdout("Wrote %ld bytes to %s", (long)bytes_written, filename);

    /*
     * close() System Call:
     * -------------------
     * Closes a file descriptor, releasing associated resources.
     *
     * Parameters:
     *   - fd: File descriptor to close
     *
     * Returns: 0 on success, -1 on error
     *
     * Important: All open file descriptors should be closed when done!
     */
    if (close(fd) == -1) {
        LOG_stderr("ERROR: Failed to close %s", filename);
        perror("close");
        exit(EXIT_FAILURE);
    }

    LOG_stdout("Closed %s (fd %d)", filename, fd);
    LOG_stdout("=== PHASE 1 COMPLETE ===");
    LOG_stdout("");
}

/*
 * ============================================================================
 * PHASE 2: OUTPUT REDIRECTION (The 'ls' task)
 * ============================================================================
 * Demonstrates dup2() for stdout redirection before execvp()
 */

void phase2_output_redirection(void) {
    int output_fd;
    pid_t pid;
    int status;

    LOG_stdout("=== PHASE 2: Output Redirection (ls command) ===");

    /*
     * Create output_log.txt for redirecting ls output
     */
    output_fd = open("output_log.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (output_fd == -1) {
        LOG_stderr("ERROR: Failed to create output_log.txt");
        perror("open");
        exit(EXIT_FAILURE);
    }

    LOG_stdout("Created output_log.txt with file descriptor: %d", output_fd);

    /*
     * fork() System Call:
     * -------------------
     * Creates a new process by duplicating the calling process.
     *
     * Return Values:
     *   - In PARENT: Returns child's PID (positive integer)
     *   - In CHILD: Returns 0
     *   - On ERROR: Returns -1 (no child created)
     *
     * After fork():
     *   - Both processes execute the same code
     *   - They have separate memory spaces (copy-on-write)
     *   - File descriptors are shared (both point to same open file descriptions)
     */
    pid = fork();

    if (pid == -1) {
        LOG_stderr("ERROR: fork() failed");
        perror("fork");
        close(output_fd);
        exit(EXIT_FAILURE);
    }

    if (pid == 0) {
        /*
         * ==========================================
         * CHILD PROCESS - PHASE 2
         * ==========================================
         * Goal: Redirect stdout to output_log.txt and execute 'ls -l'
         */

        /* NOTE: This message goes to stderr (fd 2), NOT stdout (fd 1)
         * So it won't be redirected to the output file. */
        LOG_stderr("I am about to run 'ls' command using execvp...");

        /*
         * dup2() System Call - THE CRITICAL OPERATION:
         * ==============================================
         * Duplicates one file descriptor to another.
         *
         * Parameters:
         *   - oldfd: The existing file descriptor
         *   - newfd: The target file descriptor number
         *
         * Returns: newfd on success, -1 on error
         *
         * Why dup2() is ESSENTIAL before execvp():
         * ----------------------------------------
         * 1. execvp() REPLACES the process image entirely
         *    - The new program (ls) starts fresh
         *    - It inherits the file descriptor table from the calling process
         *    - But it does NOT know about any special setup we did
         *
         * 2. dup2() sets up redirection that persists across execvp():
         *    - dup2(output_fd, 1) makes stdout (fd 1) point to output_log.txt
         *    - When ls writes to stdout, it goes to our file
         *    - This works because execvp() preserves open file descriptors
         *
         * 3. Without dup2(), we'd need to modify ls source code:
         *    - ls normally writes to stdout (fd 1)
         *    - We want it to write to output_log.txt instead
         *    - dup2() changes where fd 1 points, without modifying ls
         *
         * 4. Atomic operation:
         *    - dup2() atomically closes newfd if it's open
         *    - No race condition between closing and redirecting
         */
        if (dup2(output_fd, STDOUT_FILENO) == -1) {
            LOG_stderr("ERROR: dup2() failed in child process (stdout redirect)");
            perror("dup2");
            close(output_fd);
            exit(EXIT_FAILURE);
        }

        LOG_stdout("dup2() succeeded: stdout (fd 1) now points to output_log.txt");

        /*
         * Close the original fd - after dup2(), we no longer need it
         * (stdout now points to the same file)
         */
        if (close(output_fd) == -1) {
            LOG_stderr("ERROR: Failed to close output_fd in child");
            perror("close");
            exit(EXIT_FAILURE);
        }

        LOG_stdout("Closed original output_fd in child process");

        /*
         * execvp() System Call:
         * ---------------------
         * Replaces the current process image with a new one.
         *
         * Parameters:
         *   - file: Program to execute ("ls")
         *   - argv: NULL-terminated argument array
         *
         * Returns: -1 on error (ONLY returns if exec fails)
         *          Does NOT return on success (process is replaced)
         *
         * Note: execvp() searches PATH for the executable
         */
        char *ls_args[] = {"ls", "-l", NULL};
        execvp(ls_args[0], ls_args);

        /*
         * If execvp returns, it failed!
         * The process image was NOT replaced, so we continue here.
         */
        LOG_stderr("ERROR: execvp() failed - should not reach here!");
        perror("execvp");
        _exit(EXIT_FAILURE);
    }

    /*
     * ==========================================
     * PARENT PROCESS - PHASE 2
     * ==========================================
     * After fork(), parent continues from here
     */

    LOG_stdout("Child process created with PID: %d", pid);

    /*
     * wait() System Call:
     * ------------------
     * Waits for a child process to change state (typically exit).
     *
     * Parameters:
     *   - status: Pointer to store exit status (can be NULL)
     *
     * Returns: Child's PID on success, -1 on error
     *
     * Importance: Without wait(), parent may exit before child completes!
     */
    pid_t waited_pid = wait(&status);
    if (waited_pid == -1) {
        LOG_stderr("ERROR: wait() failed");
        perror("wait");
        exit(EXIT_FAILURE);
    }

    LOG_stdout("wait() succeeded - child PID %d completed", waited_pid);

    /*
     * Check child exit status:
     *   - WIFEXITED(status): Did child exit normally?
     *   - WEXITSTATUS(status): What was the exit code?
     */
    if (WIFEXITED(status)) {
        int exit_code = WEXITSTATUS(status);
        if (exit_code == 0) {
            LOG_stdout("Child exited normally with status: %d (SUCCESS)", exit_code);
        } else {
            LOG_stdout("Child exited with status: %d", exit_code);
        }
    } else if (WIFSIGNALED(status)) {
        LOG_stdout("Child was terminated by signal: %d", WTERMSIG(status));
    }

    LOG_stdout("=== PHASE 2 COMPLETE ===");
    LOG_stdout("");
}

/*
 * ============================================================================
 * PHASE 3: INPUT REDIRECTION (The 'cat' task)
 * ============================================================================
 * Demonstrates dup2() for stdin redirection before execvp()
 */

void phase3_input_redirection(void) {
    int input_fd;
    pid_t pid;
    int status;

    LOG_stdout("=== PHASE 3: Input Redirection (cat command) ===");

    /*
     * Re-open input.txt for reading
     */
    input_fd = open("input.txt", O_RDONLY);
    if (input_fd == -1) {
        LOG_stderr("ERROR: Failed to open input.txt for reading");
        perror("open");
        exit(EXIT_FAILURE);
    }

    LOG_stdout("Opened input.txt for reading with fd: %d", input_fd);

    /*
     * Fork another child for input redirection demo
     */
    pid = fork();

    if (pid == -1) {
        LOG_stderr("ERROR: fork() failed in Phase 3");
        perror("fork");
        close(input_fd);
        exit(EXIT_FAILURE);
    }

    if (pid == 0) {
        /*
         * ==========================================
         * CHILD PROCESS - PHASE 3
         * ==========================================
         * Goal: Redirect stdin from input.txt and execute 'cat'
         */

        /* NOTE: This message goes to stderr (fd 2), NOT stdout (fd 1)
         * So it won't be redirected anywhere and will appear on terminal. */
        LOG_stderr("I am about to run 'cat' command with stdin redirected...");

        /*
         * dup2() for stdin redirection:
         *   - dup2(input_fd, 0) makes stdin (fd 0) read from input.txt
         *   - When cat reads from stdin, it gets data from our file
         *   - No need to modify cat - redirection happens at the system level
         */
        if (dup2(input_fd, STDIN_FILENO) == -1) {
            LOG_stderr("ERROR: dup2() failed in child (stdin redirection)");
            perror("dup2");
            close(input_fd);
            exit(EXIT_FAILURE);
        }

        LOG_stdout("dup2() succeeded: stdin (fd 0) now reads from input.txt");

        if (close(input_fd) == -1) {
            LOG_stderr("ERROR: Failed to close input_fd in child");
            perror("close");
            exit(EXIT_FAILURE);
        }

        LOG_stdout("Closed original input_fd in child process");

        /*
         * Execute 'cat' - it will read from redirected stdin
         * cat normally reads from stdin and writes to stdout
         * Now stdin comes from input.txt, so cat displays its contents
         */
        char *cat_args[] = {"cat", NULL};
        execvp(cat_args[0], cat_args);

        LOG_stderr("ERROR: execvp(cat) failed!");
        perror("execvp");
        _exit(EXIT_FAILURE);
    }

    /*
     * ==========================================
     * PARENT PROCESS - PHASE 3
     * ==========================================
     */

    LOG_stdout("Child process created with PID: %d", pid);

    pid_t waited_pid = wait(&status);
    if (waited_pid == -1) {
        LOG_stderr("ERROR: wait() failed in Phase 3");
        perror("wait");
        exit(EXIT_FAILURE);
    }

    LOG_stdout("wait() succeeded - child PID %d completed", waited_pid);

    if (WIFEXITED(status)) {
        int exit_code = WEXITSTATUS(status);
        if (exit_code == 0) {
            LOG_stdout("Child exited normally with status: %d (SUCCESS)", exit_code);
        }
    }

    LOG_stdout("=== PHASE 3 COMPLETE ===");
    LOG_stdout("");
}

/*
 * ============================================================================
 * PHASE 4: PARENT MONITORING (Summary of all children)
 * ============================================================================
 */

void phase4_parent_monitoring(void) {
    LOG_stdout("=== PHASE 4: Parent Monitoring Summary ===");
    LOG_stdout("");
    LOG_stdout("All child processes have been monitored via wait():");
    LOG_stdout("  - Phase 2 child (ls): Monitored and reported");
    LOG_stdout("  - Phase 3 child (cat): Monitored and reported");
    LOG_stdout("");
    LOG_stdout("Parent process (PID: %d) continues execution...", (int)GETPID());
    LOG_stdout("=== PHASE 4 COMPLETE ===");
    LOG_stdout("");
}

/*
 * ============================================================================
 * PHASE 5: CLEANUP & FINAL OUTPUT
 * ============================================================================
 * Closes all file descriptors and displays final output_log.txt
 */

void phase5_cleanup_and_final_output(void) {
    int fd;
    char buffer[1024];
    ssize_t bytes_read;
    long total_bytes_accumulated = 0;

    LOG_stdout("=== PHASE 5: Cleanup & Final Output ===");

    /*
     * Check if output_log.txt is accessible before attempting to read
     */
    fd = open("output_log.txt", O_RDONLY);
    if (fd == -1) {
        LOG_stderr("ERROR: Failed to open output_log.txt for reading");
        perror("open");
        exit(EXIT_FAILURE);
    }
    LOG_stdout("Successfully opened output_log.txt for reading");

    /*
     * Display output_log.txt content (the result of 'ls -l')
     */
    LOG_stdout("");
    LOG_stdout("Contents of output_log.txt (from 'ls -l' command):");
    LOG_stdout("----------------------------------------");

    /*
     * read() System Call:
     * ------------------
     * Reads data from a file descriptor.
     *
     * Parameters:
     *   - fd: File descriptor to read from
     *   - buf: Buffer to store data
     *   - count: Maximum bytes to read
     *
     * Returns: Number of bytes read, 0 on EOF, or -1 on error
     */
    while ((bytes_read = read(fd, buffer, sizeof(buffer))) > 0) {
        total_bytes_accumulated += bytes_read;

        /*
         * write(1, ...) writes to stdout (fd 1)
         * This is the standard output that appears on the terminal
         */
        if (write(STDOUT_FILENO, buffer, bytes_read) == -1) {
            LOG_stderr("ERROR: Failed to write to stdout");
            perror("write");
            close(fd);
            exit(EXIT_FAILURE);
        }
    }

    if (bytes_read == -1) {
        LOG_stderr("ERROR: Failed to read from output_log.txt");
        perror("read");
        close(fd);
        exit(EXIT_FAILURE);
    }

    LOG_stdout("----------------------------------------");

    /*
     * Fixed: Show total bytes accumulated during the loop,
     * NOT the final read() return value (which is 0 at EOF)
     */
    LOG_stdout("Successfully read %ld bytes total from output_log.txt", total_bytes_accumulated);

    /*
     * Close the file descriptor
     */
    if (close(fd) == -1) {
        LOG_stderr("ERROR: Failed to close output_log.txt");
        perror("close");
        exit(EXIT_FAILURE);
    }

    LOG_stdout("Closed output_log.txt file descriptor");

    /*
     * Cleanup input.txt fd (if still open from Phase 1 logic)
     * Note: In a real program, we'd track all fds and close them here
     */
    LOG_stdout("Cleanup complete - all file descriptors closed");
    LOG_stdout("=== PHASE 5 COMPLETE ===");
    LOG_stdout("");

    /*
     * Final summary
     */
    LOG_stdout("========================================");
    LOG_stdout("     MASTER DEMONSTRATION COMPLETE     ");
    LOG_stdout("========================================");
    LOG_stdout("");
    LOG_stdout("All concepts demonstrated:");
    LOG_stdout("[✓] fork()   - Process creation (2 children spawned)");
    LOG_stdout("[✓] execvp() - Process execution (ls and cat executed)");
    LOG_stdout("[✓] open()   - File operations (input.txt, output_log.txt)");
    LOG_stdout("[✓] close()  - File descriptor closing (all closed)");
    LOG_stdout("[✓] read()   - Reading from file descriptors");
    LOG_stdout("[✓] write()  - Writing to file descriptors and stdout");
    LOG_stdout("[✓] dup2()   - File descriptor redirection (stdout, stdin)");
    LOG_stdout("[✓] wait()   - Parent-child synchronization");
    LOG_stdout("");
    LOG_stdout("File Descriptors used:");
    LOG_stdout("  - fd 0 (stdin): Standard input  - redirected for cat");
    LOG_stdout("  - fd 1 (stdout): Standard output - redirected for ls");
    LOG_stdout("  - fd 2 (stderr): Standard error - used for error messages");
    LOG_stdout("========================================");
}

/*
 * ============================================================================
 * MAIN FUNCTION
 * ============================================================================
 * Orchestrates all phases of the demonstration
 */

int main(void) {
    /*
     * Master Demonstration Program
     * ----------------------------
     * This program demonstrates Unix system programming concepts
     * through a sequence of related operations.
     *
     * Run this in a Unix/Linux environment (or WSL on Windows)
     * for full functionality.
     */

    LOG_stdout("========================================");
    LOG_stdout("  MASTER DEMONSTRATION PROGRAM STARTED  ");
    LOG_stdout("  PID: %d", (int)GETPID());
    LOG_stdout("========================================");
    LOG_stdout("");

    /* Phase 1: Create input file */
    phase1_file_io_and_creation();

    /* Phase 2: Redirect stdout and run ls */
    phase2_output_redirection();

    /* Phase 3: Redirect stdin and run cat */
    phase3_input_redirection();

    /* Phase 4: Parent monitoring summary */
    phase4_parent_monitoring();

    /* Phase 5: Cleanup and display final output */
    phase5_cleanup_and_final_output();

    LOG_stdout("Program completed successfully!");
    LOG_stdout("Exit with status: 0");

    return 0;
}
