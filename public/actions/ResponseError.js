function ResponseError(response) {
  this.message = response.statusText;
  this.response = response;
  this.stack = (new Error()).stack;
}

ResponseError.prototype = Object.create(Error.prototype);
ResponseError.prototype.constructor = ResponseError;
ResponseError.prototype.name = 'ResponseError';

export default ResponseError;
