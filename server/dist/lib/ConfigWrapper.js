"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};exports.

destructure = destructure;exports.





















traverse = traverse;var _flat = require("flat");function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function destructure(object) {var newObject = {};Object.keys(object).forEach(function (key) {var value = object[key];if ((typeof value === "undefined" ? "undefined" : _typeof(value)) === "object") {value = destructure(value);}var parts = key.split(".");var parent = newObject;while (parts.length > 1) {key = parts.shift();parent[key] = {};parent = parent[key];}key = parts.shift();parent[key] = value;});return newObject;}function traverse(object, keys, value) {
  if (!Array.isArray(keys)) keys = keys.split(".");
  var key = void 0,parent = void 0;
  while (keys.length > 0) {
    key = keys.shift();
    parent = object;
    object = parent[key];
    if (typeof object === "undefined") {
      if (typeof value !== "undefined") {
        object = parent[key] = {};
      } else {
        return null;
      }
    }
  }
  if (typeof value !== "undefined") {
    parent[key] = object = value;
  }
  return object;
}var

ConfigWrapper = function () {
  function ConfigWrapper(config) {_classCallCheck(this, ConfigWrapper);
    this.config = (0, _flat.unflatten)(config);
  }_createClass(ConfigWrapper, [{ key: "get", value: function get(

    key) {
      return traverse(this.config, key);
    } }, { key: "set", value: function set(

    key, value) {
      traverse(this.config, key, value);
      return this;
    } }, { key: "toObject", value: function toObject()

    {
      return this.config;
    } }]);return ConfigWrapper;}();exports.default = ConfigWrapper;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYlxcQ29uZmlnV3JhcHBlci5qcyJdLCJuYW1lcyI6WyJkZXN0cnVjdHVyZSIsInRyYXZlcnNlIiwib2JqZWN0IiwibmV3T2JqZWN0IiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJ2YWx1ZSIsImtleSIsInBhcnRzIiwic3BsaXQiLCJwYXJlbnQiLCJsZW5ndGgiLCJzaGlmdCIsIkFycmF5IiwiaXNBcnJheSIsIkNvbmZpZ1dyYXBwZXIiLCJjb25maWciXSwibWFwcGluZ3MiOiI7O0FBRWdCQSxXLEdBQUFBLFc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzQkFDLFEsR0FBQUEsUSxDQXhCaEIsNEIscUpBRU8sU0FBU0QsV0FBVCxDQUFxQkUsTUFBckIsRUFBNkIsQ0FDbEMsSUFBTUMsWUFBWSxFQUFsQixDQUNBQyxPQUFPQyxJQUFQLENBQVlILE1BQVosRUFBb0JJLE9BQXBCLENBQTRCLGVBQU8sQ0FDakMsSUFBSUMsUUFBUUwsT0FBT00sR0FBUCxDQUFaLENBQ0EsSUFBSSxRQUFPRCxLQUFQLHlDQUFPQSxLQUFQLE9BQWlCLFFBQXJCLEVBQStCLENBQzdCQSxRQUFRUCxZQUFZTyxLQUFaLENBQVIsQ0FDRCxDQUVELElBQU1FLFFBQVFELElBQUlFLEtBQUosQ0FBVSxHQUFWLENBQWQsQ0FFQSxJQUFJQyxTQUFTUixTQUFiLENBQ0EsT0FBT00sTUFBTUcsTUFBTixHQUFlLENBQXRCLEVBQXlCLENBQ3ZCSixNQUFNQyxNQUFNSSxLQUFOLEVBQU4sQ0FDQUYsT0FBT0gsR0FBUCxJQUFjLEVBQWQsQ0FDQUcsU0FBU0EsT0FBT0gsR0FBUCxDQUFULENBQ0QsQ0FDREEsTUFBTUMsTUFBTUksS0FBTixFQUFOLENBQ0FGLE9BQU9ILEdBQVAsSUFBY0QsS0FBZCxDQUNELENBaEJELEVBaUJBLE9BQU9KLFNBQVAsQ0FDRCxDQUVNLFNBQVNGLFFBQVQsQ0FBa0JDLE1BQWxCLEVBQTBCRyxJQUExQixFQUFnQ0UsS0FBaEMsRUFBdUM7QUFDNUMsTUFBSSxDQUFDTyxNQUFNQyxPQUFOLENBQWNWLElBQWQsQ0FBTCxFQUEwQkEsT0FBT0EsS0FBS0ssS0FBTCxDQUFXLEdBQVgsQ0FBUDtBQUMxQixNQUFJRixZQUFKLENBQVNHLGVBQVQ7QUFDQSxTQUFPTixLQUFLTyxNQUFMLEdBQWMsQ0FBckIsRUFBd0I7QUFDdEJKLFVBQU1ILEtBQUtRLEtBQUwsRUFBTjtBQUNBRixhQUFTVCxNQUFUO0FBQ0FBLGFBQVNTLE9BQU9ILEdBQVAsQ0FBVDtBQUNBLFFBQUksT0FBT04sTUFBUCxLQUFrQixXQUF0QixFQUFtQztBQUNqQyxVQUFJLE9BQU9LLEtBQVAsS0FBaUIsV0FBckIsRUFBa0M7QUFDaENMLGlCQUFTUyxPQUFPSCxHQUFQLElBQWMsRUFBdkI7QUFDRCxPQUZELE1BRU87QUFDTCxlQUFPLElBQVA7QUFDRDtBQUNGO0FBQ0Y7QUFDRCxNQUFJLE9BQU9ELEtBQVAsS0FBaUIsV0FBckIsRUFBa0M7QUFDaENJLFdBQU9ILEdBQVAsSUFBY04sU0FBU0ssS0FBdkI7QUFDRDtBQUNELFNBQU9MLE1BQVA7QUFDRCxDOztBQUVvQmMsYTtBQUNuQix5QkFBWUMsTUFBWixFQUFvQjtBQUNsQixTQUFLQSxNQUFMLEdBQWMscUJBQVVBLE1BQVYsQ0FBZDtBQUNELEc7O0FBRUdULE8sRUFBSztBQUNQLGFBQU9QLFNBQVMsS0FBS2dCLE1BQWQsRUFBc0JULEdBQXRCLENBQVA7QUFDRCxLOztBQUVHQSxPLEVBQUtELEssRUFBTztBQUNkTixlQUFTLEtBQUtnQixNQUFkLEVBQXNCVCxHQUF0QixFQUEyQkQsS0FBM0I7QUFDQSxhQUFPLElBQVA7QUFDRCxLOztBQUVVO0FBQ1QsYUFBTyxLQUFLVSxNQUFaO0FBQ0QsSyxnREFoQmtCRCxhIiwiZmlsZSI6ImxpYlxcQ29uZmlnV3JhcHBlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVuZmxhdHRlbiB9IGZyb20gXCJmbGF0XCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXN0cnVjdHVyZShvYmplY3QpIHtcbiAgY29uc3QgbmV3T2JqZWN0ID0ge307XG4gIE9iamVjdC5rZXlzKG9iamVjdCkuZm9yRWFjaChrZXkgPT4ge1xuICAgIGxldCB2YWx1ZSA9IG9iamVjdFtrZXldO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIHZhbHVlID0gZGVzdHJ1Y3R1cmUodmFsdWUpO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcnRzID0ga2V5LnNwbGl0KFwiLlwiKTtcblxuICAgIGxldCBwYXJlbnQgPSBuZXdPYmplY3Q7XG4gICAgd2hpbGUgKHBhcnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgIGtleSA9IHBhcnRzLnNoaWZ0KCk7XG4gICAgICBwYXJlbnRba2V5XSA9IHt9O1xuICAgICAgcGFyZW50ID0gcGFyZW50W2tleV07XG4gICAgfVxuICAgIGtleSA9IHBhcnRzLnNoaWZ0KCk7XG4gICAgcGFyZW50W2tleV0gPSB2YWx1ZTtcbiAgfSk7XG4gIHJldHVybiBuZXdPYmplY3Q7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmF2ZXJzZShvYmplY3QsIGtleXMsIHZhbHVlKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShrZXlzKSkga2V5cyA9IGtleXMuc3BsaXQoXCIuXCIpO1xuICBsZXQga2V5LCBwYXJlbnQ7XG4gIHdoaWxlIChrZXlzLmxlbmd0aCA+IDApIHtcbiAgICBrZXkgPSBrZXlzLnNoaWZ0KCk7XG4gICAgcGFyZW50ID0gb2JqZWN0O1xuICAgIG9iamVjdCA9IHBhcmVudFtrZXldO1xuICAgIGlmICh0eXBlb2Ygb2JqZWN0ID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIG9iamVjdCA9IHBhcmVudFtrZXldID0ge307XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHBhcmVudFtrZXldID0gb2JqZWN0ID0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIG9iamVjdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29uZmlnV3JhcHBlciB7XG4gIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgIHRoaXMuY29uZmlnID0gdW5mbGF0dGVuKGNvbmZpZyk7XG4gIH1cblxuICBnZXQoa2V5KSB7XG4gICAgcmV0dXJuIHRyYXZlcnNlKHRoaXMuY29uZmlnLCBrZXkpO1xuICB9XG5cbiAgc2V0KGtleSwgdmFsdWUpIHtcbiAgICB0cmF2ZXJzZSh0aGlzLmNvbmZpZywga2V5LCB2YWx1ZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB0b09iamVjdCgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc7XG4gIH1cbn1cbiJdfQ==