import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService, // Supabase 클라이언트 주입
    // private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, nickname } = createUserDto;

    // 1. Supabase를 통해 인증 유저 생성 요청
    const { data, error } = await this.supabase.client.auth.signUp({
      email,
      password,
    });

    if (error) {
      // 이미 가입된 이메일 등의 에러 처리
      throw new ConflictException(error.message);
    }

    if (!data.user) {
      throw new ConflictException('Supabase user creation failed.');
    }

    // 2. Prisma를 통해 우리 DB에 유저 프로필 생성
    // Supabase auth.users 테이블의 id를 우리 DB의 id와 동기화
    try {
      await this.prisma.user.create({
        data: {
          id: data.user.id, // Supabase user ID를 사용
          email,
          nickname,
          password,
        },
      });
    } catch (prismaError) {
      // Prisma 에러 발생 시, 방금 만든 Supabase 유저를 삭제하여 데이터 정합성을 맞춤
      await this.supabase.client.auth.admin.deleteUser(data.user.id);
      throw new ConflictException(
        'User profile creation failed.',
        prismaError.message,
      );
    }

    return {
      message: 'Sign up successful, please check your email for verification.',
    };
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
