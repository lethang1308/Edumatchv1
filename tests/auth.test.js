import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { createServer } from 'vite';

let server;
let authService;
let api;
let registration;
const values = new Map();

before(async () => {
  globalThis.window = new EventTarget();
  window.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  ({ api } = await server.ssrLoadModule('/src/services/api.js'));
  ({ authService } = await server.ssrLoadModule('/src/services/authService.js'));
  registration = await server.ssrLoadModule('/src/pages/Register/registerData.js');
});

after(async () => {
  await server?.close();
  delete globalThis.window;
});

beforeEach(() => values.clear());

const respond = (data, verify = () => {}) => {
  api.defaults.adapter = async (config) => {
    verify(config);
    return { data, status: 200, statusText: 'OK', headers: {}, config };
  };
};

const reject = (status, data = {}) => {
  api.defaults.adapter = async (config) => {
    throw { response: status ? { status, data } : undefined, config, message: 'Request failed' };
  };
};

test('registration sends confirmation, normalized email and snake_case birth date', () => {
  const payload = registration.buildRegistrationPayload({
    ...registration.initialForm,
    name: ' Nguyễn Văn A ', email: ' STUDENT@GMAIL.COM ', phone: '098 123.4567',
    dateOfBirth: '2002-05-15', password: 'Admin@123', confirmPassword: 'Admin@123',
  }, 'student');
  assert.equal(payload.name, 'Nguyễn Văn A');
  assert.equal(payload.email, 'student@gmail.com');
  assert.equal(payload.phone, '0981234567');
  assert.equal(payload.password_confirmation, 'Admin@123');
  assert.equal(payload.date_of_birth, '2002-05-15');
  assert.equal(payload.role, 'student');
});

test('client validation rejects short password, future date and oversized name/email', () => {
  const form = {
    ...registration.initialForm, name: 'Valid name', email: 'student@gmail.com', phone: '0981234567',
    dateOfBirth: '2002-05-15', password: 'Admin@123', confirmPassword: 'Admin@123',
  };
  assert.deepEqual(registration.validateRegistration(form, 'student'), {});
  const errors = registration.validateRegistration({
    ...form, name: 'a'.repeat(151), email: `${'a'.repeat(190)}@gmail.com`, password: '123456', dateOfBirth: '2999-01-01',
  }, 'student');
  for (const field of ['name', 'email', 'password', 'dateOfBirth']) assert.ok(errors[field], field);
});

test('Laravel field errors map to the corresponding form fields', () => {
  assert.deepEqual(registration.mapRegistrationErrors({
    email: ['Email trùng'], phone: ['Số điện thoại trùng'], date_of_birth: ['Ngày sinh sai'],
    password_confirmation: ['Chưa xác nhận'], full_name: ['Tên sai'],
  }), { email: 'Email trùng', phone: 'Số điện thoại trùng', dateOfBirth: 'Ngày sinh sai', confirmPassword: 'Chưa xác nhận', name: 'Tên sai' });
});

test('real login accepts access_token and stores returned user/profile', async () => {
  respond({ access_token: '1|real-token', user: { id: 1, name: 'Student', role: 'student', student_profile: { date_of_birth: '2002-05-15T00:00:00.000000Z' } } }, (config) => {
    assert.equal(config.url, '/auth/login');
    assert.equal(JSON.parse(config.data).phone, '0981234567');
  });
  const response = await authService.login({ phone: '0981234567', password: 'Admin@123' });
  assert.equal(response.token, '1|real-token');
  assert.equal(JSON.parse(values.get('access_token')), '1|real-token');
  assert.equal(JSON.parse(values.get('user_info')).dob, '2002-05-15');
});

test('registration persists the server session before welcome navigation', async () => {
  respond({ token: '2|registered-token', user: { id: 2, role: 'student' } });
  const response = await authService.register({ name: 'Student' });
  assert.equal(response.user.id, 2);
  assert.equal(JSON.parse(values.get('access_token')), '2|registered-token');
});

test('401, 403, 422 and network errors are propagated without a mock session', async () => {
  for (const status of [401, 403, 422, null]) {
    reject(status, { errors: { phone: ['Trùng'] } });
    await assert.rejects(authService.login({ phone: '0981234567', password: 'wrong' }));
    await assert.rejects(authService.register({}));
    assert.equal(values.size, 0);
  }
});

test('malformed successful response cannot fabricate an authenticated user', async () => {
  respond({ user: { id: 1 } });
  await assert.rejects(authService.login({}), /Phản hồi xác thực/);
  assert.equal(values.size, 0);
});

test('profile restoration calls the API with bearer token and never returns a cached demo user', async () => {
  values.set('access_token', JSON.stringify('3|saved-token'));
  values.set('user_info', JSON.stringify({ id: 'demo' }));
  respond({ user: { id: 3, role: 'student' } }, (config) => {
    assert.equal(config.url, '/auth/me');
    assert.equal(config.headers.Authorization, 'Bearer 3|saved-token');
  });
  assert.equal((await authService.getProfile()).user.id, 3);
  reject(401);
  await assert.rejects(authService.getProfile());
  assert.equal(values.has('access_token'), false);
  assert.equal(values.has('user_info'), false);
});

test('logout clears local authentication even if the API is unavailable', async () => {
  values.set('access_token', JSON.stringify('4|saved-token'));
  values.set('user_info', JSON.stringify({ id: 4 }));
  reject(null);
  await assert.rejects(authService.logout());
  assert.equal(values.size, 0);
});
