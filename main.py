
from typing import List, Optional
# from functools import lru_cache


"""
Once we have all our allocations it's basically a DFS starting with the
highest-bit key and working down.
Try each allocation, allocate it, then check if all our locks are allocated
"""
itercount = 0



def is_match(key_arr: List[int], lock_arr: List[int]):
    """
    Return true if the index of every nonzero element in the key
    is also nonzero at the same index in the lock.
    We don't care if the lock has additional nonzero indices.
    """
    assert(len(key_arr) == len(lock_arr))

    # print(f'Looking for match on key {key_arr} to lock {lock_arr}')

    for i in range(len(key_arr)):
        if (key_arr[i] == 1 and lock_arr[i] != 1): # 1 or 2 are valid?, depending on when we check.. could already be partially allocated and we won't assume the lock group is clean
            return False
    # print('found a match!')
    return True

class AllocationError(Exception):
    pass

class Key():
    bits = None
    base_key = None
    current_allocation = None
    id = None
    def __init__(self, arr, _id):
        # the entropy of the key/number of pins
        self.bits = sum(arr)
        self.base_key = list(arr)
        self.id = _id

    def __str__(self) -> str:
        return f"ID {self.id} - {self.bits} bits - {self.base_key}"

    # @lru_cache
    def rotated(self, offset):
        new = list(self.base_key)
        for i in range(offset):
            new.append(new.pop(0))
        return new


    def allocate(self, offset, lock_index):
        if self.current_allocation:
            raise ValueError('Already allocated!')
        self.current_allocation = (offset, lock_index)

    def deallocate(self):
        self.current_allocation = None


class LockGroup():
    # 2d array where each row is a ring
    locks = []

    def __init__(self, _locks):
        self.locks = [
            [l for l in r]
            for r in _locks
        ]

    def possible_key_positions(self, key: Key):
        # list of tuples (offset, lock) where the key is a fit
        positions = []

        for l in range(len(self.locks)):
            lock = self.locks[l]

            for offset in range(len(key.base_key)):
                if is_match(key.rotated(offset), lock):
                    positions.append(
                        (offset, l)
                    )
        # print(f"Possible positions of base key {self.base_key}: {allocations} (locks: {self.locks})")
        return positions

    def allocate_key(self, key, offset, lock_index):
        key_arr = key.rotated(offset)
        for i in range(len(key_arr)):
            if self.locks[lock_index][i] == 2 and key_arr[i] == 1:
                # we can't allocate a key if that slot has already been filled.
                # clean up and error out
                self.deallocate_key(key_arr, lock_index)
                raise AllocationError
            if key_arr[i] == 1:
                self.locks[lock_index][i] = 2
        key.allocate(offset, lock_index)

    def deallocate_key(self, key_arr, lock_index):
        for i in range(len(self.locks[lock_index])):
            if key_arr[i] == 1 and self.locks[lock_index][i] == 2:
                self.locks[lock_index][i] = 1

    def is_solved(self):
        for lock in self.locks:
            for bit in lock:
                if bit == 1: # unallocated
                    return False
        return True


# recursive solver
def solve(keys, lock_group):
    global itercount
    itercount += 1
    if not len(keys):
        return False

    # print(f'attempting to solve sub-problem with keys {[str(k) for k in keys]}, locks {lock_group.locks}')

    key = keys[0]

    # check if this key fits anywhere with the current allocations
    allocs = lock_group.possible_key_positions(key)
    # and if it doesn't fit, move on to the next key
    if not allocs:
        if (solve(keys[1:], lock_group)):
            return True

    for offset, lock_index in lock_group.possible_key_positions(key):
        try:
            lock_group.allocate_key(key, offset, lock_index)
        except AllocationError:
            # this key can't be allocated to this position,
            # because another already-allocated key interferes.
            # continue on to the next key
            pass
        else:
            if lock_group.is_solved():
                return True

        # this allocation didn't solve it,
        # try descending
        if (solve(keys[1:], lock_group)):
            return True

        # looks like this key position isn't part of the solution...
        # deallocate it before we move on to the next one
        lock_group.deallocate_key(key.rotated(offset), lock_index)
        key.deallocate()

    # we've exhausted the allocations for this key :(
    return False


def get_solution(key_arr, lock_arr) -> Optional[List[Key]]:
    lock_group = LockGroup(lock_arr)
    # highest-entropy first
    keys = list(reversed(sorted([
        Key(k, i) for i, k in enumerate(key_arr)
    ], key=lambda x: x.bits)))

    # exclude keys without any any possible positions
    keys = [k for k in keys if lock_group.possible_key_positions(k)]

    print(f'Locks: {lock_arr}')
    print(f'Keys ordered by bits: ')#{[f"{str(k)}" + "\n" for k in keys]}')
    for k in keys:
        print(str(k) + "\n")
    solved = solve(keys, lock_group)
    if solved:
        return keys
    else:
        return None


def test_get_solution():
    locks = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
        [0,1,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],

        # [1,0,0,1,0,1],


        # [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1],

        # [1,1,0],
        # [1,1,0],
        # [0,1,1],
    ]

    keys = [
        [0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],


        # same problem, it can't allocate a key in the middle, and gives up prematurely
        # solved by moving on if there are not allocations!
        # [1,0,0,0,0,0],
        # [1,0,1,0,0,0],
        # [1,0,0,0,0,1],


        # problem: when we allocate the last key first (tied for highest entropy)
        # it fails when it tries to allocate key #2 instead of just allocating # 1
        # [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], # 1
        # [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], # 2
        # [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0], # when we add this key we fail.. why? because it's already solved?


        # [1,1,0],
        # [1,1,0],
        # [1,0,0],
        # [1,0,0],
        # # useless keys
        # [1,1,1],
        # [1,1,1],
        # [1,1,1],
    ]

    solution = get_solution(keys, locks)
    if solution:
        print('Found a solution!')
        for k in solution:
            if k.current_allocation:
                print(f'Key #{k.id}: Offset {k.current_allocation[0]}, Lock {k.current_allocation[1]}')
            else:
                print(f'Key #{k.id}: -----')
    else:
        print('No solution found.')

def main():
    """
    One subset (rotation/offset) from each ring can only be matched once
    We could create a Key class, and then store all its matches (lock plus offset)
    """
    test_get_solution()

if __name__ == '__main__':
    main()