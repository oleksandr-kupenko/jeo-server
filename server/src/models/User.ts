export interface UserWithRelations extends User {
  createdGames: Game[];
  players: Player[];
  profile?: UserProfile;
}

export const UserModel = {
  findById: async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      include: {
        createdGames: true,
        players: true,
        profile: true
      }
    });
  },
}; 