export class User {
  constructor(
    public id: string,
    public email: string,
    public name: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  static fromObject(obj: any): User {
    return new User(
      obj.id,
      obj.email,
      obj.name,
      obj.createdAt ? new Date(obj.createdAt) : new Date(),
      obj.updatedAt ? new Date(obj.updatedAt) : new Date()
    );
  }

  toObject(): any {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  updateName(name: string): void {
    this.name = name;
    this.updatedAt = new Date();
  }
}
