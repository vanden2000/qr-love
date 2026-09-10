export type RelationshipType =
  | "COUPLE"
  | "CRUSH"
  | "FRIENDSHIP"
  | "FAMILY"
  | "COLLEAGUE";

export type OccasionType =
  | "ANNIVERSARY"
  | "VALENTINE"
  | "WOMENS_DAY"
  | "MENS_DAY"
  | "BIRTHDAY"
  | "FRIENDSHIP_DAY"
  | "ENCOURAGEMENT"
  | "CHRISTMAS_NEWYEAR";

export type PronounType =
  | "HE_TO_SHE"
  | "SHE_TO_HE"
  | "FRIEND_TO_FRIEND"
  | "CHILD_TO_PARENT"
  | "CUSTOM";

export interface RelationshipOption {
  value: RelationshipType;
  label: string;
  icon: string;
  description: string;
}

export interface OccasionOption {
  value: OccasionType;
  label: string;
  icon: string;
  description: string;
}

export interface PronounOption {
  value: PronounType;
  label: string;
  senderPlaceholder: string;
  receiverPlaceholder: string;
}

export const RELATIONSHIP_OPTIONS: RelationshipOption[] = [
  {
    value: "COUPLE",
    label: "Người yêu / Vợ chồng",
    icon: "💑",
    description: "Lãng mạn, ngọt ngào, gắn kết",
  },
  {
    value: "CRUSH",
    label: "Crush / Tỏ tình",
    icon: "💌",
    description: "Ngọt ngào, tinh tế, ngỏ lời",
  },
  {
    value: "FRIENDSHIP",
    label: "Bạn bè / Bạn thân",
    icon: "🤝",
    description: "Tri kỷ, vui tươi, đồng hành",
  },
  {
    value: "FAMILY",
    label: "Gia đình / Cha mẹ",
    icon: "🏡",
    description: "Ấm áp, hiếu thảo, biết ơn",
  },
  {
    value: "COLLEAGUE",
    label: "Đồng nghiệp / Đối tác",
    icon: "💼",
    description: "Lịch sự, trân trọng, cảm ơn",
  },
];

export const OCCASION_OPTIONS: OccasionOption[] = [
  {
    value: "ANNIVERSARY",
    label: "Kỷ niệm ngày yêu / Ngày cưới",
    icon: "💍",
    description: "Đếm số ngày yêu và hành trình bên nhau",
  },
  {
    value: "VALENTINE",
    label: "Valentine (14/2 & 14/3)",
    icon: "🌹",
    description: "Lễ tình nhân ngọt ngào",
  },
  {
    value: "WOMENS_DAY",
    label: "Ngày Phụ nữ (8/3 & 20/10)",
    icon: "🌷",
    description: "Tôn vinh và yêu thương phái đẹp",
  },
  {
    value: "MENS_DAY",
    label: "Ngày Nam giới (19/11)",
    icon: "👔",
    description: "Tri ân người đàn ông tuyệt vời",
  },
  {
    value: "BIRTHDAY",
    label: "Sinh nhật",
    icon: "🎂",
    description: "Chúc mừng tuổi mới rực rỡ",
  },
  {
    value: "FRIENDSHIP_DAY",
    label: "Kỷ niệm tình bạn",
    icon: "✨",
    description: "Gắn kết tri kỷ bền chặt",
  },
  {
    value: "ENCOURAGEMENT",
    label: "Động viên / Thi cử / Vượt khó",
    icon: "💪",
    description: "Tiếp thêm niềm tin và sức mạnh",
  },
  {
    value: "CHRISTMAS_NEWYEAR",
    label: "Giáng sinh & Năm mới",
    icon: "🎄",
    description: "An lành và hạnh phúc",
  },
];

export const PRONOUN_OPTIONS: PronounOption[] = [
  {
    value: "HE_TO_SHE",
    label: "Anh ➔ Em",
    senderPlaceholder: "Anh",
    receiverPlaceholder: "Em",
  },
  {
    value: "SHE_TO_HE",
    label: "Em ➔ Anh",
    senderPlaceholder: "Em",
    receiverPlaceholder: "Anh",
  },
  {
    value: "FRIEND_TO_FRIEND",
    label: "Mình ➔ Bạn / Tao ➔ Mày",
    senderPlaceholder: "Mình",
    receiverPlaceholder: "Bạn",
  },
  {
    value: "CHILD_TO_PARENT",
    label: "Con ➔ Bố / Mẹ",
    senderPlaceholder: "Con",
    receiverPlaceholder: "Bố / Mẹ",
  },
  {
    value: "CUSTOM",
    label: "Tự do nhập tên",
    senderPlaceholder: "Tên bạn",
    receiverPlaceholder: "Tên người nhận",
  },
];

export interface PresetSuggestion {
  dateLabel: string;
  defaultTitle: string;
  storyMessages: string[];
  sampleMessage: string;
  anniversarySubtitleFormat: (days: number) => string;
  endingCardTitle: string;
}

/**
 * Smart Preset Matrix
 */
export function getPresetSuggestion(
  relationship: RelationshipType = "COUPLE",
  occasion: OccasionType = "ANNIVERSARY",
  pronoun: PronounType = "HE_TO_SHE"
): PresetSuggestion {
  // 1. FRIENDSHIP
  if (relationship === "FRIENDSHIP") {
    if (occasion === "BIRTHDAY") {
      return {
        dateLabel: "Ngày sinh nhật của bạn",
        defaultTitle: "Chúc mừng sinh nhật bạn thân nhất trần đời 🎂",
        storyMessages: [
          "Happy Birthday!",
          "Tuổi mới rực rỡ nhé",
          "Mãi là bạn thân",
          "Ăn no chóng lớn",
          "Thành công rực rỡ nha",
          "Tiền vô như nước",
          "Luôn vui vẻ hạnh phúc",
          "Mãi đỉnh",
          "Cảm ơn vì luôn ở bên",
          "Bao giờ cũng có tao",
          "Bớt khùng lại nha",
          "Xinh đẹp mỗi ngày",
          "Sớm có người yêu nhé",
          "Uống cạn ly nào",
          "Sinh nhật vui vẻ",
        ],
        sampleMessage:
          "Chúc mày tuổi mới thật nhiều niềm vui, luôn xinh đẹp, công việc thuận lợi và sớm đạt được mọi ước mơ nhé. Dù có chuyện gì xảy ra thì tao vẫn luôn ở đây!",
        anniversarySubtitleFormat: () => `Chúc mừng sinh nhật tuổi mới rực rỡ`,
        endingCardTitle: `Happy Birthday!`,
      };
    }

    // Default Friendship / Friendship Day
    return {
      dateLabel: "Ngày bắt đầu làm bạn",
      defaultTitle: "Hành trình tình bạn diệu kỳ của chúng mình ✨",
      storyMessages: [
        "Mãi là bạn thân nhé",
        "Cảm ơn vì đã luôn ở bên",
        "Bạn chí cốt",
        "Cùng nhau già đi nha",
        "Chúc bạn luôn thành công",
        "Bao giờ cũng có tao ở đây",
        "Mãi đỉnh",
        "Tri kỷ một đời",
        "Luôn vui vẻ hạnh phúc",
        "Vững vàng bước tiếp",
        "Có phúc cùng hưởng",
        "Bạn bè tốt nhất",
        "Đừng quên tao nhé",
        "Tự hào về bạn",
        "Bình yên mỗi ngày",
      ],
      sampleMessage:
        "Cảm ơn vì đã luôn là người bạn tuyệt vời nhất, lắng nghe và đồng hành cùng mình qua bao thăng trầm. Mong tình bạn của chúng ta mãi bền chặt như ngày đầu!",
      anniversarySubtitleFormat: (days) => `${days} ngày tình bạn tuyệt vời`,
      endingCardTitle: `Mãi là bạn thân`,
    };
  }

  // 2. CRUSH / TỎ TÌNH
  if (relationship === "CRUSH") {
    return {
      dateLabel: "Ngày đầu tiên gặp nhau",
      defaultTitle: "Gửi người đặc biệt nhất trong tim mình 💌",
      storyMessages: [
        "Thích em từ cái nhìn đầu",
        "Nụ cười của em",
        "Có em là điều tuyệt vời",
        "Mong được bên em",
        "Luôn dõi theo em",
        "Em là ngoại lệ duy nhất",
        "Thật lòng thích em",
        "Chúc em luôn vui vẻ",
        "Cho anh cơ hội nhé",
        "Trái tim này thuộc về em",
        "Ấm áp mỗi khi thấy em",
        "Mỗi ngày đều nhớ em",
        "Em là ánh nắng",
        "Bình yên bên em",
        "Dành trọn chân thành",
      ],
      sampleMessage:
        "Từ ngày đầu gặp gỡ, hình bóng của em đã luôn ở trong tâm trí anh. Hôm nay anh muốn gửi món quà nhỏ này để bày tỏ sự chân thành từ tận đáy lòng.",
      anniversarySubtitleFormat: (days) => `${days} ngày thương thầm trộm nhớ`,
      endingCardTitle: `From My Heart`,
    };
  }

  // 3. GIA ĐÌNH
  if (relationship === "FAMILY") {
    return {
      dateLabel: "Ngày sinh nhật hoặc ngày kỷ niệm",
      defaultTitle: "Con yêu Bố Mẹ nhiều lắm 🏡",
      storyMessages: [
        "Con yêu Bố Mẹ",
        "Luôn mạnh khỏe nhé",
        "Bình an mỗi ngày",
        "Cảm ơn công ơn sinh thành",
        "Gia đình là tất cả",
        "Luôn tự hào về Bố Mẹ",
        "Hạnh phúc mỗi ngày",
        "Cầu chúc mọi sự an lành",
        "Con sẽ luôn cố gắng",
        "Tổ ấm thân yêu",
        "Mãi yêu gia đình",
        "Vạn sự như ý",
        "Niềm vui trọn vẹn",
        "Sức khỏe dồi dào",
        "Con thương Bố Mẹ",
      ],
      sampleMessage:
        "Cảm ơn Bố Mẹ đã luôn yêu thương, che chở và hy sinh vì con. Con chúc Bố Mẹ luôn dồi dào sức khỏe, sống vui sống khỏe và luôn hạnh phúc bên chúng con!",
      anniversarySubtitleFormat: () => `Gia đình là bến đỗ bình yên nhất`,
      endingCardTitle: `Yêu thương gia đình`,
    };
  }

  // 4. ĐỒNG NGHIỆP / ĐỐI TÁC
  if (relationship === "COLLEAGUE") {
    return {
      dateLabel: "Ngày bắt đầu hợp tác / Ngày kỷ niệm",
      defaultTitle: "Trân trọng cảm ơn sự đồng hành của bạn 💼",
      storyMessages: [
        "Chúc luôn thành công",
        "Công việc thuận buồm xuôi gió",
        "Hợp tác phát triển",
        "Vững vàng tiến bước",
        "Cảm ơn vì sự đồng hành",
        "Đạt mọi mục tiêu",
        "Nhiều năng lượng tích cực",
        "Thành tựu rực rỡ",
        "Trân trọng sự nỗ lực",
        "Phát tài phát lộc",
        "Đồng đội tuyệt vời",
        "Vươn xa hơn nữa",
        "Hạnh phúc và thành đạt",
      ],
      sampleMessage:
        "Cảm ơn sự đóng góp, nỗ lực và tinh thần đồng đội tuyệt vời của bạn trong suốt thời gian qua. Chúc bạn luôn gặt hái được nhiều thành công hơn nữa!",
      anniversarySubtitleFormat: (days) => `${days} ngày đồng hành cùng nhau`,
      endingCardTitle: `Trân trọng hợp tác`,
    };
  }

  // 5. COUPLE (Người yêu / Vợ chồng) - Theo từng dịp
  if (occasion === "VALENTINE") {
    return {
      dateLabel: "Ngày hai ta yêu nhau",
      defaultTitle: "Happy Valentine's Day My Love 🌹",
      storyMessages: [
        "Happy Valentine's Day",
        "Yêu em nhất trần đời",
        "Bên nhau mãi mãi nhé",
        "Thế giới của anh",
        "Cảm ơn vì có em",
        "Nắm chặt tay anh nhé",
        "Tình yêu ngọt ngào",
        "Hạnh phúc khi có em",
        "Luôn nuông chiều em",
        "Forever & Always",
        "Trọn đời bên nhau",
        "Trái tim chỉ có em",
        "Thương em nhiều lắm",
        "Cùng nhau già đi nhé",
        "Yêu thương đong đầy",
      ],
      sampleMessage:
        "Chúc người yêu của anh một mùa Valentine thật ngọt ngào và hạnh phúc. Cảm ơn em đã đến và mang lại cho anh những ngày tháng đẹp đẽ nhất cuộc đời!",
      anniversarySubtitleFormat: (days) => `${days} ngày yêu thương ngọt ngào`,
      endingCardTitle: `Happy Valentine's Day`,
    };
  }

  if (occasion === "WOMENS_DAY") {
    const isEm = pronoun === "SHE_TO_HE";
    return {
      dateLabel: "Ngày hai ta yêu nhau",
      defaultTitle: isEm ? "Dành tặng người phụ nữ tuyệt vời nhất 🌷" : "Chúc công chúa của anh ngày 8/3 - 20/10 rực rỡ 🌷",
      storyMessages: [
        "Chúc em luôn rạng rỡ",
        "Công chúa của anh",
        "Xinh đẹp mỗi ngày",
        "Yêu em nhiều nhất",
        "Luôn mỉm cười nhé",
        "Cảm ơn vì em đã đến",
        "Mãi nuông chiều em",
        "Hạnh phúc bên anh",
        "Trọn vẹn yêu thương",
        "Vạn điều may mắn",
        "Xinh như hoa",
        "Thương em nhiều lắm",
        "Bình yên bên nhau",
        "Dành trọn những điều tốt nhất",
        "Mãi yêu em",
      ],
      sampleMessage:
        "Chúc em ngày phụ nữ thật nhiều niềm vui, luôn xinh đẹp, rạng rỡ và nhận được tất cả những điều ngọt ngào nhất. Anh sẽ luôn ở bên và yêu thương em!",
      anniversarySubtitleFormat: (days) => `${days} ngày đong đầy yêu thương`,
      endingCardTitle: `Tôn vinh phái đẹp`,
    };
  }

  if (occasion === "MENS_DAY") {
    return {
      dateLabel: "Ngày hai ta yêu nhau",
      defaultTitle: "Chúc chàng trai của em Ngày Quốc tế Nam giới thật vui 👔",
      storyMessages: [
        "Chúc anh luôn vui vẻ",
        "Chàng trai tuyệt vời",
        "Luôn tự hào về anh",
        "Vững vàng tiến bước",
        "Bình yên bên anh",
        "Cảm ơn vì luôn che chở",
        "Em yêu anh nhiều lắm",
        "Chúc anh luôn thành công",
        "Mãi bên nhau nhé",
        "Chỗ dựa vững chắc",
        "Hạnh phúc mỗi ngày",
        "Luôn có em ở đây",
        "Thương anh nhiều",
        "Cùng nhau cố gắng nha",
        "Yêu anh nhất trần đời",
      ],
      sampleMessage:
        "Chúc anh luôn mạnh khỏe, bản lĩnh, vững vàng và thành công trên con đường mình chọn. Em luôn tự hào và yêu anh thật nhiều!",
      anniversarySubtitleFormat: (days) => `${days} ngày hạnh phúc bên nhau`,
      endingCardTitle: `Happy Men's Day`,
    };
  }

  if (occasion === "BIRTHDAY") {
    return {
      dateLabel: "Ngày sinh nhật người thương",
      defaultTitle: "Chúc mừng sinh nhật tình yêu của anh 🎂",
      storyMessages: [
        "Happy Birthday My Love",
        "Tuổi mới luôn rực rỡ",
        "Xinh đẹp và hạnh phúc",
        "Cảm ơn vì em đã sinh ra",
        "Mãi yêu em",
        "Vạn điều như ý",
        "Luôn mỉm cười nhé",
        "Bên em trọn đời",
        "Ước mơ thành hiện thực",
        "Hạnh phúc ngập tràn",
        "Món quà lớn nhất của anh",
        "Sinh nhật ấm áp",
        "Yêu em nhiều hơn mỗi ngày",
        "Mãi bên nhau nha",
      ],
      sampleMessage:
        "Chúc mừng sinh nhật tình yêu của anh! Chúc em tuổi mới luôn xinh đẹp, rạng rỡ, tràn ngập niềm vui và luôn cảm nhận được tình yêu thương anh dành cho em!",
      anniversarySubtitleFormat: () => `Chúc mừng sinh nhật tuổi mới rạng ngời`,
      endingCardTitle: `Happy Birthday My Love`,
    };
  }

  if (occasion === "ENCOURAGEMENT") {
    return {
      dateLabel: "Ngày hai ta yêu nhau",
      defaultTitle: "Luôn vững vàng, anh luôn ở đây bên em 💪",
      storyMessages: [
        "Cố lên nhé",
        "Em làm được mà",
        "Anh luôn ở đây",
        "Đừng bỏ cuộc nha",
        "Luôn tin vào em",
        "Tự hào về em",
        "Mọi chuyện sẽ ổn thôi",
        "Vững vàng bước tiếp",
        "Có anh làm điểm tựa",
        "Nghỉ ngơi chút nhé",
        "Thương em nhiều lắm",
        "Mạnh mẽ lên nào",
        "Bình yên sẽ đến",
        "Luôn đồng hành cùng em",
        "Yêu em nhiều",
      ],
      sampleMessage:
        "Dù chặng đường phía trước có khó khăn thế nào, em hãy luôn nhớ rằng anh vẫn luôn ở ngay đây, tin tưởng và đồng hành cùng em. Cố lên nhé em!",
      anniversarySubtitleFormat: (days) => `${days} ngày cùng nhau vượt qua`,
      endingCardTitle: `Luôn ở bên em`,
    };
  }

  // Default Couple Anniversary
  return {
    dateLabel: "Ngày hai ta bắt đầu yêu nhau",
    defaultTitle: "Hành trình yêu thương của chúng mình 💕",
    storyMessages: [
      "Em yêu anh",
      "Anh yêu em",
      "vững vàng",
      "thành công",
      "Happy Anniversary",
      "Chúc anh luôn vui vẻ",
      "Chúc em luôn vui vẻ",
      "Luôn bên nhau nhé",
      "Có em là đủ",
      "Tự hào về em",
      "Anh luôn ở đây",
      "Bình yên bên nhau",
      "Mãi mãi yêu em",
      "Thương em nhiều lắm",
      "Yêu thương đong đầy",
      "Nắm chặt tay nhau",
      "Cùng nhau già đi",
      "Hôm nay thật vui nhé",
    ],
    sampleMessage:
      "Cảm ơn em vì đã đến và cùng anh viết nên câu chuyện tình yêu tuyệt vời này. Mong hai ta sẽ mãi nắm chặt tay nhau đi qua mọi thăng trầm của cuộc đời!",
    anniversarySubtitleFormat: (days) => `${days} ngày đong đầy yêu thương`,
    endingCardTitle: `Hành trình yêu thương mãi mãi`,
  };
}
