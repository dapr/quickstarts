# trouter [![Build Status](https://badgen.now.sh/travis/lukeed/trouter)](https://travis-ci.org/lukeed/trouter)

> 🐟 A fast, small-but-mighty, familiar ~fish~ router


## Install

```
$ npm install --save trouter
```


## Usage

```js
import Trouter from 'trouter';

const router = new Trouter();

// Define all routes
router
  .get('/users', _ => {
    console.log('> Getting all users');
  })
  .add('POST', '/users', _ => {
    console.log('~> Adding a user');
  })
  .get('/users/:id', val => {
    console.log('~> Getting user with ID:', val);
  });

// Find a route definition
let obj = router.find('GET', '/users/123');
//=> obj.params ~> { id:123 }
//=> obj.handlers ~> Array<Function>

// Execute the handlers, passing value
obj.handlers.forEach(fn => {
  fn(obj.params.id);
});
//=> ~> Getting user with ID: 123

// Returns empty keys when no match
router.find('DELETE', '/foo');
//=> { params:{}, handlers:[] }
```

## API

### Trouter()
Initializes a new `Trouter` instance.


### trouter.add(method, pattern, ...handlers)
Returns: `self`

Stores a `method` + `pattern` pairing internally, along with its handler(s).

#### method
Type: `String`

Any uppercased, [valid HTTP/1.1 verb](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods#Specifications) &mdash; choose from one of the following:

```
GET  HEAD  PATCH  OPTIONS  CONNECT  DELETE  TRACE  POST  PUT
```

#### pattern
Type: `String` or `RegExp`

Trouter supports simple route patterns which are fast and well readable but limited. If you need more complex patterns, you can pass an instance of `RegExp` with parameters specified as named capture groups.

> **Important:** RegExp named capture groups are [supported in Node.js 10.x](https://node.green/#ES2018-features--RegExp-named-capture-groups) and above!

The supported route pattern types are:

* static (`/users`)
* named parameters (`/users/:id`)
* nested parameters (`/users/:id/books/:title`)
* optional parameters (`/users/:id?/books/:title?`)
* suffixed parameters (`/movies/:title.mp4`, `movies/:title.(mp4|mov)`)
* any match / wildcards (`/users/*`)

#### ...handlers
Type: `Function`

The function(s) that should be tied to this `pattern`.

Because this is a [rest parameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters), whatever you pass will _always_ be cast to an Array.

> **Important:** Trouter does not care what your function signature looks like!<br> You are not bound to the `(req, res)` standard, or even passing a `Function` at all!


### trouter.use(pattern, ...handlers)
Returns: `self`

This is an alias for [`trouter.add('', pattern, ...handlers)`](#trouteraddmethod-pattern-handlers), matching **all** HTTP methods.

However, unlike [`trouter.all`](#trouterallpattern-handlers), the `pattern` you defined **IS NOT RESTRICTIVE**, which means that the route will match any & all URLs that start (but not end) with a matching segment.

```js
router.use('/foo', 'USE /foo');
router.use('/foo/:name', 'USE /foo/:name');
router.post('/foo/:name', 'POST /foo/:name');
router.head('/foo/:name/hello', 'HEAD /foo/:name/hello');

router.find('GET', '/foo').handlers;
//=> ['USE /foo']

router.find('POST', '/foo/bar').handlers;
//=> ['USE /foo', 'USE /foo/:name', 'POST /foo/:name']

router.find('HEAD', '/foo/bar/hello').handlers;
//=> ['USE /foo', 'USE /foo/:name', 'HEAD /foo/:name/hello']
```
<sup>_Compare this snippet with the one below to see differences between `trouter.all` and this method._</sup>


### trouter.all(pattern, ...handlers)
Returns: `self`

This is an alias for [`trouter.add('', pattern, ...handlers)`](#trouteraddmethod-pattern-handlers), matching **all** HTTP methods.

However, unlike [`trouter.use`](#trouterusepattern-handlers), the `pattern` you defined **IS RESTRICTIVE** and behaves like any other [`trouter.METHOD`](#trouteraddmethod-pattern-handlers) route. This means that the URL must match the defined `pattern` exactly – or have the appropriate optional and/or wildcard segments to accommodate the desired flexibility.

```js
router.all('/foo', 'ALL /foo');
router.all('/foo/:name', 'ALL /foo/:name');
router.post('/foo/:name', 'POST /foo/:name');
router.head('/foo/:name/hello', 'HEAD /foo/:name/hello');

router.find('GET', '/foo').handlers;
//=> ['ALL /foo']

router.find('POST', '/foo/bar').handlers;
//=> ['ALL /foo/:name', 'POST /foo/:name']

router.find('HEAD', '/foo/bar/hello').handlers;
//=> ['HEAD /foo/:name/hello']
```
<sup>_Compare this snippet with the one above to see differences between `trouter.use` and this method._</sup>



### trouter.METHOD(pattern, ...handlers)

This is an alias for [`trouter.add(METHOD, pattern, ...handlers)`](#trouteraddmethod-pattern-handlers), where `METHOD` is any lowercased HTTP verb.

```js
const noop = _ => {}:
const app = new Trouter();

app.get('/users/:id', noop);
app.post('/users', noop);
app.patch('/users/:id', noop);

// less common methods too
app.trace('/foo', noop);
app.connect('/bar', noop);
```

### trouter.find(method, url)
Returns: `Object`

Searches within current instance for **all** `method` + `pattern` pairs that satisfy the current `method` + `url`.

> **Important:** Parameters and handlers are assembled/gathered _in the order that they were defined!_

This method will always return an Object with `params` and `handlers` keys.

* `params` &mdash; Object whose keys are the named parameters of your route pattern.
* `handlers` &mdash; Array containing the `...handlers` provided to [`.add()`](#trouteraddmethod-pattern-handlers) or [`.METHOD()`](#troutermethodpattern-handlers)

> **Note:** The `handlers` and `params` keys will be empty if no matches were found.


#### method
Type: `String`

Any valid HTTP method name, uppercased.

> **Note:** When searching for `HEAD` routes, `GET` routes will also be inspected.

#### url
Type: `String`

The URL used to match against pattern definitions. This is typically `req.url`.


## Benchmarks

> Run on Node v10.13.0

```
GET /                           x 10,349,863 ops/sec ±2.15% (93 runs sampled)
POST /users                     x 13,895,099 ops/sec ±0.40% (94 runs sampled)
GET /users/:id                  x  6,288,457 ops/sec ±0.25% (93 runs sampled)
PUT /users/:id/books/:title?    x  6,176,501 ops/sec ±0.22% (96 runs sampled)
DELETE /users/:id/books/:title  x  5,581,288 ops/sec ±2.04% (96 runs sampled)
HEAD /hello (all)               x  9,700,097 ops/sec ±0.47% (90 runs sampled)
```

## License

MIT © [Luke Edwards](https://lukeed.com)
