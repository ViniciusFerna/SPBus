# SPBus — Mobilidade Urbana em São Paulo

Aplicativo acadêmico da Global Solution de **Cross-Platform Application Development**, desenvolvido com **React Native, Expo e TypeScript**. Permite pesquisar linhas da SPTrans, consultar pontos e previsões de chegada e salvar linhas favoritas.

## Integrantes

- **Matheus Guedes Grigorio:** — **RM:** 568086
- **Vinícius Fernandes Silva Souza:** — **RM:** 567977


## Pré-requisitos

- Node.js 20 ou superior (idealmente versão LTS compatível com Expo)
- Aplicativo Expo Go ou emulador Android/iOS
- Token pessoal da API Olho Vivo obtido no site APILIB da prefeitura de São Paulo: https://apilib.prefeitura.sp.gov.br/store/apis/info?name=OlhoVivo&version=v2.1&provider=admin
- Computador e celular na mesma rede, para uso via Expo Go

## Instalação

1. Na raiz do aplicativo, execute:

```bash
npm install
npx expo install react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage
npm install @react-navigation/native @react-navigation/native-stack
```

2. Na pasta `server`, execute `npm install`.
3. Copie `server/.env.example` para `server/.env` e configure `APILIB_TOKEN`.
4. Copie `.env.example` para `.env` na raiz, informando `EXPO_PUBLIC_API_URL`.
   - Em celular físico: `http://IP_DO_COMPUTADOR:3333`, obtendo o IPv4 via `ipconfig` (Windows).
   - No Android Emulator: `http://10.0.2.2:3333`.
   - No iOS Simulator / navegador no mesmo PC: `http://localhost:3333`.
5. Em um terminal execute `cd server && npm start`.
6. Em outro terminal, na raiz Expo, execute `npx expo start -c`.
7. Abra no Expo Go. Libere a porta 3333 no firewall, se necessário.

Teste a API local acessando `http://IP_DO_COMPUTADOR:3333/saude` — deve responder `{"ok":true}`.

## Como usar

1. Pesquise pelo número da linha (ex.: `8000`) ou destino (ex.: `Lapa`).
2. Escolha uma linha e seu sentido.
3. Toque em um ponto de parada para consultar as previsões de chegada dos veículos.
4. Adicione a linha aos favoritos e acesse a lista pela tela inicial.
5. Feche e abra o aplicativo: os favoritos continuarão salvos.

**Observação: a API Olho Vivo possui limitações na cobertura dos pontos de parada. Por esse motivo, algumas linhas podem não apresentar todas as suas paradas ou retornar listas vazias.**

## Limitações

A API é externa: previsões dependem da disponibilidade da SPTrans, do horário de operação, de dados dos veículos e de um token válido. O servidor precisa estar ligado para consultas online. A lista de favoritos funciona offline após ter sido salva.

## Referências

**Portal APILIB — Prefeitura de São Paulo**

https://apilib.prefeitura.sp.gov.br/store/

**API Olho Vivo v2.1**

https://apilib.prefeitura.sp.gov.br/store/apis/info?name=OlhoVivo&version=v2.1&provider=admin

**Documentação da API Olho Vivo — SPTrans**

https://www.sptrans.com.br/desenvolvedores/api-do-olho-vivo-guia-de-referencia/documentacao-api/

---
