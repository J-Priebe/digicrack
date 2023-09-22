const isMatch = (keyArr: number[], lockArr: number[]): boolean => {
  /*
    Return true if the index of every nonzero element in the key
    is free (value of 1) at the same index in the lock.
    We don't care if the lock has additional nonzero indices.
    */
  if (keyArr.length !== lockArr.length) {
    throw new Error("Key and lock arrays must have the same length.");
  }

  for (let i = 0; i < keyArr.length; i++) {
    if (keyArr[i] === 1 && lockArr[i] !== 1) {
      return false;
    }
  }
  return true;
};

class AllocationError extends Error {}

class Key {
  bits: number;
  baseKey: number[];
  currentAllocation: [number, number] | null = null;
  id: number;

  constructor(arr: number[], id: number) {
    this.bits = arr.reduce((acc, val) => acc + val, 0);
    this.baseKey = [...arr];
    this.id = id;
  }

  rotated(offset: number): number[] {
    const newArray = [...this.baseKey];
    for (let i = 0; i < offset; i++) {
      newArray.push(newArray.shift() as number);
    }
    return newArray;
  }

  allocate(offset: number, lockIndex: number): void {
    if (this.currentAllocation !== null) {
      throw new AllocationError("Already allocated!");
    }
    this.currentAllocation = [offset, lockIndex];
  }

  deallocate(): void {
    this.currentAllocation = null;
  }

  toString(): string {
    return `ID ${this.id} - ${this.bits} bits - ${this.baseKey}`;
  }
}

class LockGroup {
  locks: number[][] = [];

  constructor(_locks: number[][]) {
    this.locks = _locks.map((row) => [...row]);
  }

  possibleKeyPositions(key: Key): [number, number][] {
    const positions: [number, number][] = [];

    for (let l = 0; l < this.locks.length; l++) {
      const lock = this.locks[l];

      for (let offset = 0; offset < key.baseKey.length; offset++) {
        if (isMatch(key.rotated(offset), lock)) {
          positions.push([offset, l]);
        }
      }
    }
    return positions;
  }

  allocateKey(key: Key, offset: number, lockIndex: number): void {
    const keyArr = key.rotated(offset);
    for (let i = 0; i < keyArr.length; i++) {
      if (this.locks[lockIndex][i] === 2 && keyArr[i] === 1) {
        this.deallocateKey(keyArr, lockIndex);
        // in theory we should never hit this, because we only
        // try to allocate on freshly computed possible positions
        throw new AllocationError();
      }
      if (keyArr[i] === 1) {
        this.locks[lockIndex][i] = 2;
      }
    }
    key.allocate(offset, lockIndex);
  }

  deallocateKey(keyArr: number[], lockIndex: number): void {
    for (let i = 0; i < this.locks[lockIndex].length; i++) {
      if (keyArr[i] === 1 && this.locks[lockIndex][i] === 2) {
        this.locks[lockIndex][i] = 1;
      }
    }
  }

  isSolved(): boolean {
    for (const lock of this.locks) {
      for (const bit of lock) {
        if (bit === 1) { // unallocated
          return false;
        }
      }
    }
    return true;
  }
}

const solve = (keys: Key[], lockGroup: LockGroup): boolean => {
  if (keys.length === 0) {
    return false;
  }

  const key = keys[0];
  const allocs = lockGroup.possibleKeyPositions(key);

  if (allocs.length === 0) {
    if (solve(keys.slice(1), lockGroup)) {
      return true;
    }
  }

  for (const [offset, lockIndex] of allocs) {
    try {
      lockGroup.allocateKey(key, offset, lockIndex);
    } catch (error) {
      if (error instanceof AllocationError) {
        continue;
      } else {
        throw error;
      }
    }
    if (lockGroup.isSolved()) {
        return true;
    }

    // this allocation didn't solve it,
    // try descending
    if (solve(keys.slice(1), lockGroup)) {
      return true;
    }
    // looks like this key position isn't part of the solution...
    // deallocate it before we move on to the next one
    lockGroup.deallocateKey(key.rotated(offset), lockIndex);
    key.deallocate();
  }
  // we've exhausted the possible positions for this key
  // in the current sub-problem.
  return false;
};

export const getSolution = (
  keyArr: number[][],
  lockArr: number[][]
): Key[] | null => {
  const lockGroup = new LockGroup(lockArr);

  // Order our keys by highest-bits first,
  // because they provide the greatest reduction in entropy
  const keys = keyArr
    .map((k, i) => new Key(k, i))
    .sort((a, b) => b.bits! - a.bits!);

  // Don't bother checking keys without any possible positions
  const filteredKeys = keys.filter(
    (key) => lockGroup.possibleKeyPositions(key).length > 0
  );

  console.log(`Locks: ${lockArr}`);
  console.log("Usable keys ordered by bits:");
  for (const key of filteredKeys) {
    console.log(key.toString());
  }

  const solved = solve(filteredKeys, lockGroup);

  if (solved) {
    return keys;
  } else {
    return null;
  }
};
