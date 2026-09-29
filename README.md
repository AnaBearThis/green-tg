# green-tg

Веб-чат для отправки и получения текстовых сообщений в **Telegram** через [GREEN-API](https://green-api.com/telegram/docs/api/). Интерфейс повторяет [web.telegram.org](https://web.telegram.org/).

Демо: https://anabearthis.github.io/green-tg/

## Как пользоваться

1. Откройте сайт и введите `idInstance` и `apiTokenInstance` из [личного кабинета GREEN-API](https://console.green-api.com). `apiUrl` подставляется автоматически (`https://{первые 4 цифры idInstance}.api.green-api.com`), при необходимости его можно поправить.
2. В поле «Новый чат» введите номер телефона получателя (например, `+7 900 123-45-67`) и нажмите `+`.
3. Напишите сообщение и нажмите Enter (Shift+Enter переносит строку).
4. Ответ собеседника из Telegram появится в чате.

## Почему решение шире ТЗ

В ТЗ сказано сделать интерфейс «максимально простым, с минимальным набором функций». Основной сценарий именно такой: вход, новый чат по номеру, отправка и получение текстовых сообщений. Но я хотела сделать минимальную версию, которой приятно и понятно пользоваться, а не только демонстрацию методов API. Поэтому добавила то, без чего чат на практике ломается или сбивает с толку:

- **Проверка настроек инстанса и кнопка «Включить».** У нового инстанса уведомления выключены, и без этого входящие просто не приходят, причём непонятно почему. Я сама на это наткнулась.
- **Отметки о прочтении и счётчик непрочитанных.** Без `readChat` у собеседника сообщения навсегда остаются непрочитанными, а без статусов непонятно, дошло ли сообщение.
- **Работа в нескольких вкладках.** Без неё вторая открытая вкладка «съедает» часть сообщений из общей очереди.
- **UI-кит в `shared/ui`.** Это не отдельная функциональность, а способ не дублировать стили. Интерфейс получается единообразным, и его легко расширять.

Всё это работает на тех же методах HTTP API, что указаны в ТЗ, и не усложняет основной сценарий. Меню содержит только кнопку «Выйти».

## Как это работает

| Действие | Метод GREEN-API |
|---|---|
| Проверка учётных данных при входе | [`getStateInstance`](https://green-api.com/telegram/docs/api/account/GetStateInstance/) |
| Создание чата по номеру телефона | [`checkAccount`](https://green-api.com/telegram/docs/api/service/CheckAccount/) |
| Отправка сообщения | [`sendMessage`](https://green-api.com/telegram/docs/api/sending/SendMessage/) |
| Отметка входящих прочитанными (у собеседника появляются ✓✓) | [`readChat`](https://green-api.com/telegram/docs/api/marks/ReadChat/): при открытии чата и при новых сообщениях в открытом чате, если вкладка видна |
| Проверка и включение нужных настроек инстанса | [`getSettings`](https://green-api.com/telegram/docs/api/account/GetSettings/), [`setSettings`](https://green-api.com/telegram/docs/api/account/SetSettings/) |
| Получение сообщений и отметок о прочтении | [HTTP API](https://green-api.com/telegram/docs/api/receiving/technology-http-api/): цикл `receiveNotification` → `deleteNotification` |

Для приёма нужны пустой `webhookUrl`, `incomingWebhook: "yes"` (входящие) и `outgoingWebhook: "yes"` (статусы исходящих). У нового инстанса они выключены. Если настройки не подходят, после входа приложение покажет предупреждение с кнопкой «Включить». Инстанс после этого перезапускается, и настройки применяются в течение 5 минут.

Отметки у исходящих сообщений повторяют Telegram. Их источник — уведомления [`outgoingMessageStatus`](https://green-api.com/telegram/docs/api/receiving/notifications-format/statuses/OutgoingMessageStatus/):

- 🕓 — сообщение отправляется;
- ✓ — отправлено или доставлено (`delivered`);
- ✓✓ — прочитано (`read`);
- красный «!» — ошибка (`failed`, `noAccount`), причина показывается во всплывающей подсказке.

Отличия от исходного ТЗ для MAX:

- **Номер телефона переводится в `chatId` через `checkAccount`.** Входящие уведомления Telegram приходят с числовым `chatId` пользователя, а не с номером телефона. Если отправлять на `79001234567@c.us`, ответы нельзя будет сопоставить с чатом.
- Обрабатываются только текстовые сообщения (`textMessage`, `extendedTextMessage`). Остальные уведомления удаляются из очереди, чтобы она не забивалась.
- Сообщения, отправленные с телефона (`outgoingMessageReceived`), тоже показываются в чате. Если собеседник напишет первым, чат с ним создастся автоматически.

Учётные данные и история чатов хранятся только в `localStorage` браузера.

**Несколько вкладок.** Очередь уведомлений у инстанса одна, и её читает только одна вкладка ([Web Locks API](https://developer.mozilla.org/docs/Web/API/Web_Locks_API)). Иначе вкладки удаляли бы уведомления друг у друга. Все изменения чатов (входящие, отправленные, статусы, прочтение) рассылаются остальным вкладкам через `BroadcastChannel`. Когда принимающую вкладку закрывают, приём подхватывает следующая. В меню видно, какая вкладка сейчас принимает сообщения.

## Настройки (.env)

| Переменная | По умолчанию | Назначение |
|---|---|---|
| `VITE_API_URL_TEMPLATE` | `https://{prefix}.api.green-api.com` | Шаблон `apiUrl`, `{prefix}` — первые 4 цифры `idInstance` |
| `VITE_API_URL_FALLBACK` | `https://api.green-api.com` | `apiUrl`, если `idInstance` короче 4 цифр |
| `VITE_CONSOLE_URL` | `https://console.green-api.com` | Ссылка на личный кабинет на экране входа |
| `VITE_POLL_RETRY_MS` | `5000` | Пауза перед повторным опросом очереди после ошибки, мс |
| `VITE_STORAGE_PREFIX` | `green-tg` | Префикс ключей `localStorage` |
| `VITE_ID_INSTANCE`, `VITE_API_TOKEN_INSTANCE`, `VITE_API_URL` | пусто | Автозаполнение формы входа при локальной разработке |

Все `.env*` файлы в `.gitignore`, в репозитории только пример — [.env.example](.env.example). Без `.env` приложение работает на значениях по умолчанию из [src/config.ts](src/config.ts), так собирается и GitHub Pages. Для локальной настройки выполните `cp .env.example .env` и поменяйте нужное. Все `VITE_*` переменные встраиваются в собранный JS, поэтому для публичной сборки токен в них не указывайте.

## Разработка

```bash
npm install
npm run dev      # локальный сервер
npm run build    # сборка в dist/
npm run lint
```

Стек: React 19, TypeScript, Vite, CSS Modules.

### Структура

```
src/
  api.ts, chats.ts, storage.ts, format.ts   — работа с GREEN-API, состояние чатов, localStorage
  recipient.ts                              — разбор номера телефона / @username
  config.ts                                 — настройки из .env
  hooks/                                    — логика мессенджера: useChats (состояние + синхронизация вкладок),
                                              useNotificationPolling, useInstanceSettings, useChatActions,
                                              useMarkChatRead, usePageVisible
  components/                               — экраны приложения, каждый в своей папке с *.module.css:
                                              Login, Messenger, Sidebar, ChatView, StatusIcon
  shared/
    styles/global.css                       — дизайн-токены (цвета, радиусы) и сброс стилей
    lib/                                    — cx, errors, pause, tabs (Web Locks и BroadcastChannel)
    ui/                                     — переиспользуемые компоненты без логики чата
```

Компоненты в `shared/ui` настраиваются только через пропсы и лежат каждый в своей папке вместе с `*.module.css`. Импорт — из `shared/ui`:

| Компонент | Назначение и основные пропсы |
|---|---|
| `Button` | `variant` (`primary`, `secondary`, `ghost`, `ghostAccent`, `ghostDanger`), `size` (`xs`–`lg`), `shape` (`rounded`, `circle`), `loading`, `icon`, `fullWidth`, `align` |
| `IconButton` | Круглая кнопка с иконкой: `icon`, `label` (обязателен, это aria-label), плюс пропсы `Button` |
| `Icon` | `name`, `size` |
| `TextField` | Поле с плавающей подписью: `label`, `hint`, `invalid` |
| `PillInput` | Поле-капсула: `leading`, `trailing` |
| `TextArea` | Растущее поле-капсула: `onSubmitKey` (Enter — отправить, Shift+Enter — новая строка) |
| `Panel` | Скруглённая панель: `as`, `radius` (`md`, `lg`, `pill`), `padding` |
| `Alert` | `tone` (`warning`, `error`, `info`), `action` |
| `Menu` | Выпадающее меню: `icon`, `label`, `items`, `header`, `align` |
| `ListItem` | Строка списка: `leading`, `title`, `meta`, `subtitle`, `badge`, `subtitleLines`, `active` |
| `MessageBubble` | `direction` (`in`, `out`), `tail`, `meta` |
| `Avatar` | `name`, `seed`, `src`, `size` |
| `Badge` | Счётчик: `count`, `max`, `tone` (`accent`, `muted`, `inverted`) |
| `Chip`, `Separator`, `EmptyState`, `Spinner` | Мелкие вспомогательные элементы |

## Деплой

При пуше в `main` GitHub Actions ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) собирает проект и публикует его на GitHub Pages. Один раз нужно включить Pages в настройках репозитория: **Settings → Pages → Source: GitHub Actions**.
