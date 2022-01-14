import {
    JoinColumn,
    OneToOne,
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
    ManyToMany,
} from 'typeorm';
// import { Department, Company, Country, LoginAuth, ResetPw, Socket, PrivateChatRoom, NoticeBoard } from '.';
import { Department, Company, Country, LoginAuth, ResetPw, PrivateChatRoom, NoticeBoard } from '.';
import ApprovalFrame from './approvalFrame.entity';
import ApprovalStep from './approvalStep.entity';
import { BaseEntity } from 'typeorm';

import Grant from './Grant.entity';
import CalledMembers from './calledMembers.entity';
import UserProfileFile from './userProfileFile.entity';
import GroupChatRoom from './groupChatRoom.entity';
@Entity({ name: 'USER_TABLE' })
export default class User {
    @PrimaryGeneratedColumn()
    USER_PK: number;

    @Column({ type: 'varchar', length: 20, unique: true })
    NICKNAME: string;

    @Column({ type: 'varchar', length: 512, nullable: false })
    PASSWORD: string;

    @Column({ type: 'varchar', length: 128, nullable: false })
    SALT: string;

    @Column({ type: 'varchar', length: 20, nullable: false })
    FIRST_NAME: string;

    @Column({ type: 'varchar', length: 20, nullable: false })
    LAST_NAME: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    EMAIL: string;

    @Column({ type: 'varchar', length: 30, nullable: false })
    TEL: string;

    @Column({ type: 'integer', nullable: false })
    CREATE_DATE: number;

    @Column({ type: 'integer', default: 0, nullable: false })
    IS_DELETED: number;

    @Column({ type: 'integer', default: 0, nullable: false })
    IS_VERIFIED: number;

    @Column({ type: 'integer' })
    COMPANY_PK: number;

    @Column({ type: 'integer' })
    DEPARTMENT_PK: number;

    @Column({ type: 'integer', nullable: false })
    COUNTRY_PK: number;

    @Column()
    USER_PROFILE_PK: number;

    @ManyToOne((type) => Company, (company) => company.user)
    @JoinColumn({ name: 'COMPANY_PK' })
    company: Company;

    @ManyToOne((type) => Department, (department) => department.users)
    @JoinColumn({ name: 'DEPARTMENT_PK' })
    department: Department;

    @OneToOne((type) => LoginAuth, (loginAuth) => loginAuth.user)
    loginAuth: LoginAuth;

    @ManyToOne((type) => Country, (country) => country.users)
    @JoinColumn({ name: 'COUNTRY_PK' })
    country: Country;

    @OneToMany((type) => ResetPw, (resetPw) => resetPw.user)
    resetPws: ResetPw[];

    @ManyToMany(() => PrivateChatRoom, (chatRoom) => chatRoom.USER_1)
    socket1: PrivateChatRoom[];

    @ManyToMany(() => PrivateChatRoom, (chatRoom) => chatRoom.USER_2)
    socket2: PrivateChatRoom[];

    @OneToMany(() => Grant, (grant) => grant.user)
    grants: Grant[];

    @OneToMany(() => CalledMembers, (calledMember) => calledMember.user)
    calledMembers: CalledMembers[];

    @OneToOne(() => UserProfileFile, (profile) => profile.user)
    @JoinColumn({ name: 'USER_PROFILE_PK' })
    profile: UserProfileFile;

    @OneToMany(() => NoticeBoard, (nb) => nb.user)
    @JoinColumn({ name: 'USER_PK' })
    user: NoticeBoard;

    @OneToMany(() => GroupChatRoom, (groupChatRoom) => groupChatRoom.admin)
    groupChatRooms: GroupChatRoom[];

    @OneToMany(() => NoticeBoard, (nb) => nb.updateUser)
    @JoinColumn({ name: 'USER_PK' })
    updateUser: NoticeBoard;

    @OneToMany(() => ApprovalFrame, (af) => af.afUser)
    @JoinColumn({ name: 'USER_PK' })
    afUser: ApprovalFrame;

    @OneToMany(() => ApprovalStep, (as) => as.asUser)
    @JoinColumn({ name: 'USER_PK' })
    asUser: ApprovalStep;
}
