# Database

## Create and run database container

```bash
docker build -t creativeflow-postgres .

docker run --env-file ./docker.env --name creativeflow-db -p 5432:5432 creativeflow-postgres
```

## Set backend connection string

```bash
.env

DATABASE_URL="postgresql://<user>:<password>@localhost:5432/creativeflow"

# Set <user> and <password> with the values provided inside 'docker.env'
```

## Run prisma

```bash
# Creates database structure
npx prisma migrate dev --name init

# Verify conenction
npx prisma db pull

#Database seeding
npm run prisma:seed

#Reset database
npm run prisma:reset

#Database update
npm run prisma:update
```

## Padrão de nomenclatura de branch

- `nous_<task-name>`: Para tarefas que não estão relacionadas a um ticket ( task-name em `kebab-case` )
- `us-<ticket-number>_<task-name>`: Para tarefas relacionadas a um ticket ( ticket-number -> número seprarados por "-"; task-name em kebab-case )
- `fix-us-<ticket-number>_<task-name>`: Para correções de bugs em tarefaz já mergeadas ( ticket-number -> número seprarados por "-"; task-name em kebab-case )

## Padrão de commit

- Tags:

  - `feat`: Para novas funcionalidades
  - `fix`: Para correções de bugs
  - `infra`: Para tarefas de manutenção

- `[tag]: <past verb> <description>`
  - Exemplo: `[feat]: added new feature to component`
  - Exemplo: `[fix]: resolved render error in component`
  - Exemplo: `[infra]: updated dependencies`

## Nomenclatura de arquivos

- Diretórios (pastas) devem ser nomeados em `camelCase` (exemplo: `src/controllers`)
- Todos os arquivos devem ser nomeados em `camelCase` (exemplo: `src/controllers/userExercise.controller.ts`)
- Todos os arquivos devem ser nomeados baseados nas entidades dos mesmos no arquivo `schema.prisma` seguidos por sua função arquitetural (exemplo: O arquivo de _service_ da entidade _User_ deve ser nomeado `user.service.ts`)
- Arquivos de DTO devem, além de seguir os padrões anteriores, possuir o sufixo `DTO` (exemplo: o DTO de recebido de um exercício de usuário, deve ser nomeado `userExerciseDTO.dto.ts`)
- Arquivos de teste devem estar dentro de um diretório `tests` dentro do diretório arquitetural correspondente e devem ter a denominação `spec` ( exemplo: `src/controllers/tests/userExercise.controller.spec.ts` )

## Desenvolvimento

- _Rotas_:
  - Objetos Controllers devem ser nomeados em `PascalCase` (exemplo: `export class UserExerciseController`)
  - Controllers devem ter o _decorator_ `@ApiBearerAuth('Authorization')` em seu cabeçalho isso fará a autenticação do usuário com o token JWT se aplicar a todas as rotas dentro daquele controller
  - Rotas públicas devem ter o _decorator_ `@IsPublic()`, isso fará com que o token JWT não seja necessário para acessar a rota.
  - Na declaração da rota, o NestJS exige um decorator para o tipo de rota (GET, POST, DELETE, etc) e o caminho da rota. O caminho deve ser nomeado em `kebab-case` (exemplo: `@Get('/user-exercise')`)
  - Em casos que a rota tenha um único parâmetro, o mesmo deve ser nomeado em `kebab-case` e passado diretamente no URL(exemplo: `@Get('/user-exercise/:id')` e nos parâmetros da função `getUserExercise(@Param('id') id: string)`)
  - Em casos que a rota tenha mais de um parâmetro, deve ser utilizado um DTO personalizado para aquele caso
  - Todos os métodos de um _controller_ devem ter seus parâmetros e seus retornos tipados, mesmo que o retorno seja `void`(exemplo: `getUserExercise(@Param('id') id: string): Promise<UserExerciseDTO>`)
- _Data Transfer Objects (DTOs)_:
  - DTOs devem ter apenas os campos necessários para a operação que estão realizando e devem ter decorators do `class-validator` para validação dos dados recebidos. Exemplo: `@IsString()`, `@IsEmail()`, `@IsNotEmpty()`, `@IsOptional()`, `@IsBoolean()`, `@IsNumber()`, `@IsDate()`, etc.
  - DTOs devem ser nomeados em `PascalCase` e devem ter o sufixo `DTO` (exemplo: `UserExerciseDTO.dto.ts`)
- _Serivces_:
  - Objetos Service devem ser nomeados em `PascalCase` (exemplo: `export class UserExerciseService`)
  - Services devem ter o decorator `@Injectable()` em seu cabeçalho
  - Todos os métodos de um _service_ devem ter seus parâmetros e seus retornos tipados, mesmo que o retorno seja `void`(exemplo: `getUserExercise(id: string): Promise<UserExerciseDTO>`)
  - Erros esperados (como usuário não estar no BD) devem ser lançados com o `HttpException` do NestJS, passando o código de erro e a mensagem de erro. Exemplo: `throw new HttpException('User not found', HttpStatus.NOT_FOUND)`
- _Mappers_:
  - Mappers devem ser utilizados para a criação de linhas nas tabelas do banco de dados (veja exemplo no arquivo `src/mappers/user.mapper.ts`)
  - Mappers devem ser nomeados em `PascalCase` e devem ter o sufixo `Mapper` (exemplo: `UserExerciseMapper.mapper.ts`)
- _Código_:
  Desenvolver o código em inglês
- _Formatação_:
  Antes de commitar rodar `npm run lint -- --fix` para corrigir os erros de formatação, erros no código apontados pelo eslint devem ser corrigidos na mão, evitar o uso do `// eslint-disable-next-line` para ignorar os erros
