import { ROLES } from "configs/settings";
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("users")
export class User {
  @PrimaryColumn()
  name!: string;

  @Column()
  secret?: string;

  @Column()
  secretCandidate?: string;

  @Column({ array: true })
  chainMarket?: ChainMarket[] = undefined;

  @Column({ default: true })
  isActived: boolean = true;

  @Column()
  roles: string[] = [ROLES.basic];

  @CreateDateColumn({ default: new Date() })
  createTime?: Date;

  @UpdateDateColumn({ default: new Date() })
  updateTime?: Date;
}

@Entity()
export class ChainMarket {
  @PrimaryColumn()
  chainName!: string;

  @PrimaryColumn()
  marketAddr!: string;

  @Column(() => CybavoVault)
  vault?: CybavoVault | string | undefined;
}

@Entity()
export class CybavoVault {
  @Column()
  walletId!: string;

  @Column()
  prefix!: string;

  @Column()
  apiCode!: string;

  @Column()
  apiSecret!: string;
}
