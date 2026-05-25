import { BASE_URL } from '@/utils/helpers';
import YAML from 'yaml';

export async function GET({}) {
  const siteId =
    import.meta.env.PUBLIC_DECAPBRIDGE_ID ||
    'b24d4304-f503-45ca-b408-da24db405ebb';
  const repo = import.meta.env.PUBLIC_REPO || 'rodnye/wa-catalog';
  const branch = import.meta.env.PUBLIC_REPO_BRANCH || 'maite/data';
  const site = import.meta.env.SITE;

  const config = {
    media_folder: '/public/images',
    public_folder: '/images',

    backend: {
      name: 'git-gateway',
      repo,
      branch,
      auth_type: 'pkce',
      base_url: 'https://auth.decapbridge.com',
      auth_endpoint: `/sites/${siteId}/pkce`,
      auth_token_endpoint: `/sites/${siteId}/token`,
      gateway_url: 'https://gateway.decapbridge.com',

      commit_messages: {
        create: 'data: create "{{slug}}" - {{author-name}} via DecapBridge',
        update: 'data: update "{{slug}}" - {{author-name}} via DecapBridge',
        delete: 'data: delete "{{slug}}" - {{author-name}} via DecapBridge',
        uploadMedia:
          'data: upload "{{path}}" - {{author-name}} via DecapBridge',
        deleteMedia:
          'data: delete "{{path}}" - {{author-name}} via DecapBridge',
        openAuthoring:
          'data: message {{message}} - {{author-name}} via DecapBridge',
      },
    },

    auth: {
      email_claim: 'email',
      first_name_claim: 'first_name',
      last_name_claim: 'last_name',
      avatar_url_claim: 'avatar_url',
    },

    logo_url: 'https://raw.githubusercontent.com/rodnye/wa-catalog/maite/main/src/assets/logo_brand.webp',
    site_url: site.replace(/\/$/, '') + BASE_URL,

    collections: [
      {
        name: 'products',
        extension: 'json',
        label: 'Productos',
        folder: 'src/data/products',
        create: true,
        slug: '{{name}}',
        editor: {
          preview: false,
        },
        fields: [
          {
            label: 'Nombre del producto',
            name: 'name',
            widget: 'string',
          },
          {
            label: 'Es muy importante??',
            name: 'featured',
            widget: 'boolean',
            default: false,
          },
          {
            label: 'Es VIP??',
            name: 'vip',
            widget: 'boolean',
            default: false,
          },
          {
            label: 'Está disponible??',
            name: 'available',
            widget: 'boolean',
            default: true,
          },
          {
            label: 'Descripción o pequeño resumen',
            name: 'description',
            widget: 'string',
          },
          {
            label: 'Fotos del producto',
            name: 'images',
            widget: 'list',
            field: { label: 'Imagen', name: 'image', widget: 'image' },
          },
          {
            label: 'Categorías',
            name: 'categories',
            widget: 'relation',
            collection: 'config',
            file: 'categories',
            multiple: true,
            search_fields: ['categories.*.label'],
            display_fields: ['categories.*.label'],
            value_field: 'categories.*.key',
          },
        ],
      },
      {
        name: 'config',
        label: 'Configuración',
        files: [
          {
            name: 'categories',
            extension: 'json',
            editor: {
              preview: false,
            },
            label: 'Categorías',
            file: 'src/data/categories.json',
            fields: [
              {
                label: 'categories',
                name: 'categories',
                widget: 'list',
                fields: [
                  {
                    label: 'Nombre',
                    name: 'label',
                    widget: 'string',
                  },
                  {
                    label: 'Emoji',
                    name: 'emoji',
                    widget: 'string',
                    default: '🌿',
                  },
                  {
                    label: 'Clave/ID',
                    name: 'key',
                    widget: 'string',
                    default: 'key1234',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  return new Response(YAML.stringify(config), {
    headers: {
      'Content-Type': 'application/x-yaml',
    },
  });
}
