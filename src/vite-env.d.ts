interface ViteTypeOptions {
  // この行を追加することで ImportMetaEnv の型を厳密にし、不明なキーを許可しないように
  // できます。
  // strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly VITE_INSTANT_APP_ID: string;
  // その他の環境変数...
}

type ServerProcessEnv = {
  readonly AI_GATEWAY_API_KEY?: string;
  //! admin token はサーバ専用秘密情報。VITE_ プレフィックスでクライアントに露出させない
  readonly INSTANT_APP_ADMIN_TOKEN?: string;
};

declare const process: {
  readonly env: ServerProcessEnv;
};

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
