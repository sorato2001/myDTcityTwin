export function singleTon<T>(classType: { new (...args: any[]): T }) {
  let instance;
  return new Proxy(classType, {
    construct: function (target, args) {
      if (!instance) {
        instance = new target(...args);
        Object.defineProperty(classType.prototype, 'constructor', {
          value: undefined,
          writable: false,
          enumerable: false,
          configurable: true,
        });
      }

      return instance;
    },
  });
}
