// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const getRequest = require(`@google-cloud/nodejs-repo-tools`).getRequest;
const test = require(`ava`);

module.exports = (DATA_BACKEND) => {
  let originalDataBackend, id, testConfig, appConfig;

  test.before(() => {
    testConfig = require(`./_test-config`);
    appConfig = require(`../config`);
    originalDataBackend = appConfig.get(`DATA_BACKEND`);
    appConfig.set(`DATA_BACKEND`, DATA_BACKEND);
  });

  // setup a product
  test.serial.cb(`should create a product`, (t) => {
    getRequest(testConfig)
      .post(`/api/products`)
      .send({ title: `my product` })
      .expect(200)
      .expect((response) => {
        id = response.body.id;
        t.truthy(response.body.id);
        t.is(response.body.title, `my product`);
      })
      .end(t.end);
  });

  test.serial.cb(`should show a list of products`, (t) => {
    // Give Datastore time to become consistent
    setTimeout(() => {
      const expected = /<div class="media-body">/;
      getRequest(testConfig)
        .get(`/products`)
        .expect(200)
        .expect((response) => {
          t.regex(response.text, expected);
        })
        .end(t.end);
    }, 2000);
  });

  test.serial.cb(`should handle error`, (t) => {
    getRequest(testConfig)
      .get(`/products`)
      .query({ pageToken: `badrequest` })
      .expect(500)
      .end(t.end);
  });

  // delete the product
  test.serial.cb((t) => {
    if (id) {
      getRequest(testConfig)
        .delete(`/api/products/${id}`)
        .expect(200)
        .end(t.end);
    } else {
      t.end();
    }
  });

  test.serial.cb(`should post to add product form`, (t) => {
    const expected = /Redirecting to \/products\//;
    getRequest(testConfig)
      .post(`/products/add`)
      .send(`title=my%20product`)
      .expect(302)
      .expect((response) => {
        const location = response.headers.location;
        const idPart = location.replace(`/products/`, ``);
        if (DATA_BACKEND !== `mongodb`) {
          id = parseInt(idPart, 10);
        } else {
          id = idPart;
        }
        t.regex(response.text, expected);
      })
      .end(t.end);
  });

  test.serial.cb(`should show add product form`, (t) => {
    const expected = /Add product/;
    getRequest(testConfig)
      .get(`/products/add`)
      .expect(200)
      .expect((response) => {
        t.regex(response.text, expected);
      })
      .end(t.end);
  });

  // delete the product
  test.serial.cb((t) => {
    if (id) {
      getRequest(testConfig)
        .delete(`/api/products/${id}`)
        .expect(200)
        .end(t.end);
    } else {
      t.end();
    }
  });

  // setup a product
  test.serial.cb((t) => {
    getRequest(testConfig)
      .post(`/api/products`)
      .send({ title: `my product` })
      .expect(200)
      .expect((response) => {
        id = response.body.id;
        t.truthy(response.body.id);
        t.is(response.body.title, `my product`);
      })
      .end(t.end);
  });

  test.serial.cb(`should update a product`, (t) => {
    const expected = new RegExp(`Redirecting to /products/${id}`);
    getRequest(testConfig)
      .post(`/products/${id}/edit`)
      .send(`title=my%20other%20product`)
      .expect(302)
      .expect((response) => {
        t.regex(response.text, expected);
      })
      .end(t.end);
  });

  test.serial.cb(`should show edit product form`, (t) => {
    const expected =
      /<input type="text" name="title" id="title" value="my other product" class="form-control">/;
    getRequest(testConfig)
      .get(`/products/${id}/edit`)
      .expect(200)
      .expect((response) => {
        t.regex(response.text, expected);
      })
      .end(t.end);
  });

  test.serial.cb(`should show a product`, (t) => {
    const expected = /<h4>my other product&nbsp;<small><\/small><\/h4>/;
    getRequest(testConfig)
      .get(`/products/${id}`)
      .expect(200)
      .expect((response) => {
        t.regex(response.text, expected);
      })
      .end(t.end);
  });

  test.serial.cb(`should delete a product`, (t) => {
    const expected = /Redirecting to \/products/;
    getRequest(testConfig)
      .get(`/products/${id}/delete`)
      .expect(302)
      .expect((response) => {
        id = undefined;
        t.regex(response.text, expected);
      })
      .end(t.end);
  });

  // clean up
  test.always.after.cb((t) => {
    appConfig.set(`DATA_BACKEND`, originalDataBackend);

    if (id) {
      getRequest(testConfig)
        .delete(`/api/products/${id}`)
        .expect(200)
        .end(t.end);
    } else {
      t.end();
    }
  });
};
