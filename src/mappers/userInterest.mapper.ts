export class UserInterestMapper {
  static toPrisma(userId: string, interestIds: string[]) {
    return interestIds.map((interestId) => ({
      user_id: userId,
      interest_id: interestId,
    }));
  }
}
