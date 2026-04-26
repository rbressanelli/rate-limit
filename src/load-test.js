import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  vus: 200,         // 100 usuários virtuais
  duration: '40s',  // durante 30 segundos
};

export default function () {
  http.get('http://localhost:3000/api/v1/users');
  sleep(1);
}