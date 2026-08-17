import { IProduct } from '@bot/types';

export class GitHubService {
  private token: string;
  private repo: string;
  private branch: string;
  private userAgent: string;

  constructor(
    token: string,
    repo: string,
    branch: string,
    /**
     *
     */
    userAgent: string,
  ) {
    this.token = token;
    this.repo = repo;
    this.branch = branch;
    this.userAgent = userAgent;
  }

  private async getSha(path: string): Promise<string | null> {
    const url = `https://api.github.com/repos/${this.repo}/contents/${path}?ref=${this.branch}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'User-Agent': 'WA-Bot',
      },
    });
    if (res.ok) {
      const data = await res.json();
      return data.sha;
    }
    return null;
  }

  async commitFile(
    path: string,
    content: string | Buffer,
    message: string,
    isBase64 = false,
    author?: string,
  ): Promise<void> {
    const sha = await this.getSha(path);
    const url = `https://api.github.com/repos/${this.repo}/contents/${path}`;

    const body: any = {
      message,
      branch: this.branch,
      content: isBase64
        ? content.toString('base64')
        : Buffer.from(content).toString('base64'),
    };

    if (sha) {
      body.sha = sha;
    }

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'WA-Bot',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`GitHub API Error: ${res.status} ${err}`);
    }
  }

  async commitProduct(
    product: IProduct,
    imageBuffer?: Buffer,
    imageExt = '.jpg',
    author?: string,
  ): Promise<void> {
    const jsonPath = `src/data/products/${product.id}.json`;
    const jsonContent = JSON.stringify(product, null, 2);

    await this.commitFile(
      jsonPath,
      jsonContent,
      `data: create "${product.name}" ${author ? `by "${author} ` : ''}via ${this.userAgent}`,
    );

    if (imageBuffer) {
      const imgPath = `public/images/${product.id}${imageExt}`;
      await this.commitFile(
        imgPath,
        imageBuffer,
        `data: upload "${product.id}${imageExt}" ${author ? `by "${author} ` : ''}via ${this.userAgent}`,
        true,
      );
    }
  }
}
