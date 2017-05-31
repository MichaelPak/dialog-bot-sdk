class Index {
  constructor(json) {
    this.json = json;
  }

  get(id) {
    const raw = this.json[id];
    return raw ? Buffer.from(raw, 'base64') : null;
  }

  has(id) {
    return Boolean(this.json[id]);
  }

  set(id, value) {
    this.json[id] = value;
  }

  delete(id) {
    delete this.json[id];
  }

  forEach(callback) {
    Object.keys(this.json).forEach((key) => {
      callback(key, this.get(key));
    });
  }

  clear() {
    Object.keys(this.json).forEach((key) => {
      delete this.json[key];
    });
  }

  toJSON() {
    const json = {};
    Object.keys(this.json).forEach((key) => {
      json[key] = Buffer.from(this.json[key]).toString('base64');
    });

    return json;
  }
}

class AsyncStorage {
  constructor(localStorage) {
    this.storage = localStorage;
  }

  transaction(type, keyspace, resolve, reject, callback) {
    try {
      const storageKey = `ngkv_${keyspace}`;
      const index = new Index(this.storage.getJSONItem(storageKey) || {});

      resolve(callback(index));

      if (type === 'readwrite') {
        this.storage.setJSONItem(storageKey, index);
      }
    } catch (e) {
      console.error(e);
      reject(e);
    }
  }

  addOrUpdateItem(keyspace, value, resolve, reject) {
    this.transaction('readwrite', keyspace, resolve, reject, (index) => {
      index.set(value.id, value.data);
    });
  }

  addOrUpdateItems(keyspace, values, resolve, reject) {
    this.transaction('readwrite', keyspace, resolve, reject, (index) => {
      values.forEach((value) => {
        index.set(value.id, value.data);
      });
    });
  }

  removeItem(keyspace, key, resolve, reject) {
    this.transaction('readwrite', keyspace, resolve, reject, (index) => {
      index.delete(key);
    });
  }

  removeItems(keyspace, keys, resolve, reject) {
    this.transaction('readwrite', keyspace, resolve, reject, (index) => {
      keys.forEach((key) => {
        index.delete(key);
      });
    });
  }

  loadItem(keyspace, key, resolve, reject) {
    this.transaction('readonly', keyspace, resolve, reject, (index) => {
      return index.get(key);
    });
  }

  loadItems(keyspace, keys, resolve, reject) {
    this.transaction('readonly', keyspace, resolve, reject, (index) => {
      const result = [];
      keys.forEach((id) => {
        const data = index.get(id);
        if (data) {
          result.push({ id, data });
        }
      });

      return result;
    });
  }

  loadAllItems(keyspace, resolve, reject) {
    this.transaction('readonly', keyspace, resolve, reject, (index) => {
      const result = [];
      index.forEach((id, data) => {
        result.push({ id, data });
      });

      return result;
    });
  }

  exists(keyspace, key, resolve, reject) {
    this.transaction('readonly', keyspace, resolve, reject, (index) => {
      return index.has(key);
    });
  }

  clear(keyspace, resolve, reject) {
    this.transaction('readwrite', resolve, reject, (index) => {
      index.clear();
    });
  }
}

module.exports = AsyncStorage;
