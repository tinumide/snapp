'use strict';

const Chance = require('chance');
const express = require('express');
const { expect } = require('chai');

const app = express();
const http = require('http');
const supertest = require('supertest');
const loaders = require('../../src/loaders');
const config = require('../../src/config');
loaders(app);

describe('order services', () => {
    let server;
    let request;
    let apiAccessToken;
    let orderId;
    const chance = new Chance();
    const email = chance.email({domain: "test.com"}); 
    const name = chance.name();
    const password = "123ABC";

    beforeAll((done) => {
        server = http.createServer(app);
        server.listen(done);
        request = supertest(server);
    });
    
    afterAll((done) => {
        server.close(done);
    });

    describe('register cutomer', () => {

        it('should register a new customer', async () => {
            const customer = {
                email: email,
                name: name,
                password: password
            }
    
            const response = await request.post('/api/customers').send(customer).set('Accept', 'application/json')    
            expect(response.status).to.equal(200);
            expect(response.body.customer).to.exist
            expect(response.body.customer.schema).to.exist
            expect(response.body.accessToken).to.exist
            expect(response.body.expires_in).to.exist
            apiAccessToken = response.body.accessToken;
        });
    });

    describe('add orders', () => {
        it('should post an order', async () => {

            const order = {
                tax_id: 1,
                shipping_id: 2,
                cart_id: 'b25fb1b5'
            }

            const response = await request.post('/api/orders').send(order).set('USER-KEY', apiAccessToken).set('Accept', 'application/json');
            expect(response.status).to.equal(200);
            expect(response.body.orderId).to.exist
            orderId = response.body.orderId;
        });
    });

    describe('make payment', () => {
        it('should make payments for an order', async () => {
            jest.setTimeout(30000);

            const payment = {
                amount: 1000,
                order_id: orderId,
                stripeToken: 'OzftPEBUOwKWNOHq',
                description: 'gucci shoes'
            }

            const response = await request.post('/api/stripe/charge').send(payment).set('USER-KEY', apiAccessToken).set('Accept', 'application/json');
            expect(response.status).to.equal(200);
        });
    });
});