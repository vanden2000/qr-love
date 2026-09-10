export type RelationshipType =
  | "COUPLE"
  | "CRUSH"
  | "FRIENDSHIP"
  | "FAMILY"
  | "COLLEAGUE";

export type OccasionType =
  // COUPLE
  | "LOVE_ANNIVERSARY"
  | "WEDDING_ANNIVERSARY"
  | "FIRST_DATE_ANNIVERSARY"
  | "PROPOSAL_ANNIVERSARY"
  | "BIRTHDAY_LOVER"
  | "VALENTINE"
  | "WOMENS_DAY"
  | "MENS_DAY"
  | "CHRISTMAS_COUPLE"
  | "TRAVEL_MEMORY"
  | "APOLOGY_RECONCILIATION"
  | "JUST_BECAUSE"
  // CRUSH
  | "CONFESSION"
  | "CRUSH_BIRTHDAY"
  | "FIRST_MET_CRUSH"
  | "CRUSH_ENCOURAGEMENT"
  // FRIENDSHIP
  | "FRIENDSHIP_ANNIVERSARY"
  | "FRIEND_BIRTHDAY"
  | "GRADUATION"
  | "FAREWELL"
  | "FRIEND_ENCOURAGEMENT"
  // FAMILY
  | "MOTHERS_DAY"
  | "FATHERS_DAY"
  | "FAMILY_DAY"
  | "PARENTS_WEDDING"
  | "PARENTS_BIRTHDAY"
  | "TET_HOLIDAY"
  // COLLEAGUE
  | "WORK_ANNIVERSARY"
  | "COLLEAGUE_BIRTHDAY"
  | "PROMOTION_FAREWELL";

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
  relationship: RelationshipType;
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
    description: "Lãng mạn, ngọt ngào, nhiều ngày kỷ niệm",
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

export const ALL_OCCASION_OPTIONS: OccasionOption[] = [
  // ==================== 1. COUPLE (Người yêu / Vợ chồng) ====================
  {
    value: "LOVE_ANNIVERSARY",
    relationship: "COUPLE",
    label: "Kỷ niệm ngày yêu nhau (Đếm ngày yêu)",
    icon: "💍",
    description: "100 ngày, 1 năm, 1000 ngày... yêu thương bên nhau",
  },
  {
    value: "WEDDING_ANNIVERSARY",
    relationship: "COUPLE",
    label: "Kỷ niệm ngày cưới (Wedding Anniversary)",
    icon: "💒",
    description: "Hành trình hôn nhân hạnh phúc viên mãn",
  },
  {
    value: "FIRST_DATE_ANNIVERSARY",
    relationship: "COUPLE",
    label: "Kỷ niệm lần đầu gặp gỡ / Buổi hẹn đầu tiên",
    icon: "☕",
    description: "Nơi tình yêu bắt đầu chớm nở",
  },
  {
    value: "PROPOSAL_ANNIVERSARY",
    relationship: "COUPLE",
    label: "Kỷ niệm ngày chính thức nhận lời / Cầu hôn",
    icon: "💖",
    description: "Khoảnh khắc hai trái tim hòa làm một",
  },
  {
    value: "BIRTHDAY_LOVER",
    relationship: "COUPLE",
    label: "Sinh nhật người yêu / Vợ / Chồng",
    icon: "🎂",
    description: "Chúc mừng tuổi mới của người quan trọng nhất",
  },
  {
    value: "VALENTINE",
    relationship: "COUPLE",
    label: "Lễ tình nhân Valentine (14/2 & 14/3)",
    icon: "🌹",
    description: "Trao trọn yêu thương ngọt ngào",
  },
  {
    value: "WOMENS_DAY",
    relationship: "COUPLE",
    label: "Ngày Phụ nữ (8/3 & 20/10)",
    icon: "🌷",
    description: "Nuông chiều và tôn vinh công chúa / bà xã",
  },
  {
    value: "MENS_DAY",
    relationship: "COUPLE",
    label: "Ngày Quốc tế Nam giới (19/11)",
    icon: "👔",
    description: "Tri ân người đàn ông che chở cho em",
  },
  {
    value: "CHRISTMAS_COUPLE",
    relationship: "COUPLE",
    label: "Giáng sinh & Năm mới bên nhau (Noel / New Year)",
    icon: "🎄",
    description: "Mùa đông ấm áp trong vòng tay nhau",
  },
  {
    value: "TRAVEL_MEMORY",
    relationship: "COUPLE",
    label: "Kỷ niệm chuyến du lịch / Chuyến đi cùng nhau",
    icon: "✈️",
    description: "Lưu giữ những khung trời kỷ niệm",
  },
  {
    value: "APOLOGY_RECONCILIATION",
    relationship: "COUPLE",
    label: "Ngày làm lành / Xin lỗi & Gắn kết lại",
    icon: "🕊️",
    description: "Bỏ qua hờn dỗi, thấu hiểu và yêu nhau nhiều hơn",
  },
  {
    value: "JUST_BECAUSE",
    relationship: "COUPLE",
    label: "Ngày thường bất ngờ (Mỗi ngày đều là ngày yêu)",
    icon: "✨",
    description: "Không cần dịp lễ, bất ngờ gửi trao yêu thương",
  },

  // ==================== 2. CRUSH (Tỏ tình / Thầm thương) ====================
  {
    value: "CONFESSION",
    relationship: "CRUSH",
    label: "Tỏ tình / Ngỏ lời yêu thương",
    icon: "💌",
    description: "Món quà tinh tế để mở lời chân thành",
  },
  {
    value: "CRUSH_BIRTHDAY",
    relationship: "CRUSH",
    label: "Chúc mừng sinh nhật Crush",
    icon: "🎂",
    description: "Gửi lời chúc ấm áp đến người thầm thương",
  },
  {
    value: "FIRST_MET_CRUSH",
    relationship: "CRUSH",
    label: "Kỷ niệm ngày đầu tiên thấy bóng hình ai đó",
    icon: "👀",
    description: "Khoảnh khắc tim lỡ một nhịp",
  },
  {
    value: "CRUSH_ENCOURAGEMENT",
    relationship: "CRUSH",
    label: "Động viên & Tiếp sức cho Crush",
    icon: "💪",
    description: "Luôn âm thầm ủng hộ và quan tâm",
  },

  // ==================== 3. FRIENDSHIP (Bạn bè / Bạn thân) ====================
  {
    value: "FRIENDSHIP_ANNIVERSARY",
    relationship: "FRIENDSHIP",
    label: "Kỷ niệm ngày bắt đầu làm bạn (Đếm ngày tình bạn)",
    icon: "✨",
    description: "Bao nhiêu năm tri kỷ bên nhau",
  },
  {
    value: "FRIEND_BIRTHDAY",
    relationship: "FRIENDSHIP",
    label: "Sinh nhật bạn thân chí cốt",
    icon: "🎂",
    description: "Chúc mừng tuổi mới quẩy tưng bừng",
  },
  {
    value: "GRADUATION",
    relationship: "FRIENDSHIP",
    label: "Lễ tốt nghiệp cùng nhau (Graduation)",
    icon: "🎓",
    description: "Khép lại thời học sinh / sinh viên rực rỡ",
  },
  {
    value: "FAREWELL",
    relationship: "FRIENDSHIP",
    label: "Bạn đi xa / Du học / Bước ngoặt mới",
    icon: "🛫",
    description: "Dù xa nhau vạn dặm vẫn mãi là bạn thân",
  },
  {
    value: "FRIEND_ENCOURAGEMENT",
    relationship: "FRIENDSHIP",
    label: "Động viên thi cử / Vượt qua thử thách",
    icon: "💪",
    description: "Bao giờ cũng có tao ở đây ủng hộ mày",
  },

  // ==================== 4. FAMILY (Gia đình / Cha mẹ) ====================
  {
    value: "MOTHERS_DAY",
    relationship: "FAMILY",
    label: "Ngày của Mẹ (Mother's Day & 8/3 - 20/10)",
    icon: "🌸",
    description: "Tri ân tình yêu bao la của Mẹ",
  },
  {
    value: "FATHERS_DAY",
    relationship: "FAMILY",
    label: "Ngày của Cha (Father's Day)",
    icon: "👔",
    description: "Kính chúc Bố luôn mạnh mẽ và vững vàng",
  },
  {
    value: "FAMILY_DAY",
    relationship: "FAMILY",
    label: "Ngày Gia đình Việt Nam (28/6)",
    icon: "🏡",
    description: "Tổ ấm bình yên và thiêng liêng nhất",
  },
  {
    value: "PARENTS_WEDDING",
    relationship: "FAMILY",
    label: "Kỷ niệm ngày cưới Bố Mẹ (Bạc / Vàng / Kim cương)",
    icon: "💒",
    description: "Chúc mừng hạnh phúc bền lâu của Bố Mẹ",
  },
  {
    value: "PARENTS_BIRTHDAY",
    relationship: "FAMILY",
    label: "Mừng sinh nhật / Mừng thọ Bố Mẹ",
    icon: "🎂",
    description: "Cầu chúc Bố Mẹ luôn an khang, trường thọ",
  },
  {
    value: "TET_HOLIDAY",
    relationship: "FAMILY",
    label: "Chúc Tết & Năm mới Gia đình",
    icon: "🧧",
    description: "Xuân sum vầy, vạn sự cát tường",
  },

  // ==================== 5. COLLEAGUE (Đồng nghiệp / Đối tác) ====================
  {
    value: "WORK_ANNIVERSARY",
    relationship: "COLLEAGUE",
    label: "Kỷ niệm ngày làm việc / Hợp tác cùng nhau",
    icon: "💼",
    description: "Đồng hành và phát triển vững bền",
  },
  {
    value: "COLLEAGUE_BIRTHDAY",
    relationship: "COLLEAGUE",
    label: "Sinh nhật Đồng nghiệp / Sếp / Đối tác",
    icon: "🎂",
    description: "Chúc mừng tuổi mới thành công rực rỡ",
  },
  {
    value: "PROMOTION_FAREWELL",
    relationship: "COLLEAGUE",
    label: "Chúc mừng thăng chức / Tri ân chia tay",
    icon: "🚀",
    description: "Vươn xa hơn nữa trên nấc thang sự nghiệp",
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

export function getOccasionsForRelationship(
  relationship: RelationshipType = "COUPLE"
): OccasionOption[] {
  return ALL_OCCASION_OPTIONS.filter((opt) => opt.relationship === relationship);
}

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
  occasion?: OccasionType,
  pronoun: PronounType = "HE_TO_SHE"
): PresetSuggestion {
  // =========================================================================
  // 1. COUPLE (Người yêu / Vợ chồng) - Rất nhiều ngày kỷ niệm đa dạng
  // =========================================================================
  if (relationship === "COUPLE") {
    // 1.1 Kỷ niệm ngày cưới
    if (occasion === "WEDDING_ANNIVERSARY") {
      return {
        dateLabel: "Ngày hai ta tổ chức đám cưới",
        defaultTitle: "Kỷ niệm ngày cưới - Trọn đời bên nhau 💒",
        storyMessages: [
          "Happy Wedding Anniversary",
          "Trọn đời bên nhau",
          "Mãi mãi một tình yêu",
          "Cảm ơn vì có anh/em",
          "Tổ ấm hạnh phúc",
          "Cùng nhau già đi nhé",
          "Nắm chặt tay nhau",
          "Bình yên mỗi sớm mai",
          "Bên nhau trọn kiếp",
          "Hạnh phúc viên mãn",
          "Mãi là của nhau",
          "Yêu thương đong đầy",
          "Luôn vì nhau mà cố gắng",
          "Gia đình nhỏ ấm áp",
          "Forever With You",
        ],
        sampleMessage:
          "Cảm ơn người bạn đời tuyệt vời nhất của anh/em. Kể từ ngày khoác lên mình bộ lễ phục, mỗi ngày trôi qua bên nhau đều là một ngày hạnh phúc. Chúc mừng kỷ niệm ngày cưới của chúng mình!",
        anniversarySubtitleFormat: (days) => `${days} ngày hạnh phúc hôn nhân`,
        endingCardTitle: `Happy Wedding Anniversary`,
      };
    }

    // 1.2 Lần đầu gặp gỡ / Buổi hẹn đầu
    if (occasion === "FIRST_DATE_ANNIVERSARY") {
      return {
        dateLabel: "Ngày đầu tiên hai ta gặp gỡ",
        defaultTitle: "Kỷ niệm ngày đầu gặp gỡ định mệnh ☕",
        storyMessages: [
          "Khoảnh khắc đầu tiên",
          "Ánh mắt đầu tiên",
          "Trái tim lỡ nhịp",
          "Định mệnh đã an bài",
          "Nụ cười ngày ấy",
          "Cảm ơn vì đã gặp em",
          "Mỗi ngày thêm yêu",
          "Tình yêu chớm nở",
          "Buổi hẹn đầu tiên",
          "Không thể nào quên",
          "Từ người lạ thành người thương",
          "Hành trình kỳ diệu",
          "Mãi yêu như ngày đầu",
          "Bình yên bên em",
        ],
        sampleMessage:
          "Anh/Em vẫn nhớ như in khoảnh khắc lần đầu tiên ánh mắt hai ta chạm nhau. Đó là ngày đẹp trời nhất, khởi đầu cho mọi điều tuyệt vời của chúng mình hôm nay!",
        anniversarySubtitleFormat: (days) => `${days} ngày từ lần đầu gặp gỡ`,
        endingCardTitle: `First Met Memory`,
      };
    }

    // 1.3 Ngày nhận lời yêu / Tỏ tình
    if (occasion === "PROPOSAL_ANNIVERSARY") {
      return {
        dateLabel: "Ngày hai ta chính thức nhận lời yêu",
        defaultTitle: "Kỷ niệm ngày anh/em nói câu đồng ý 💖",
        storyMessages: [
          "Ngày em nói đồng ý",
          "Khoảnh khắc thiêng liêng",
          "Hai trái tim chung nhịp",
          "Chính thức là của nhau",
          "Hạnh phúc ngập tràn",
          "Nắm tay đi hết cuộc đời",
          "Lời hứa chân thành",
          "Bên nhau mãi mãi",
          "Yêu thương trọn vẹn",
          "Không bao giờ buông tay",
          "Trân trọng từng phút giây",
          "Tình yêu diệu kỳ",
        ],
        sampleMessage:
          "Cảm ơn em/anh vì ngày hôm ấy đã gật đầu đồng ý trao cho anh/em cơ hội được chăm sóc và yêu thương. Anh/Em hứa sẽ luôn giữ trọn lời thề nguyện ngày nào!",
        anniversarySubtitleFormat: (days) => `${days} ngày chính thức bên nhau`,
        endingCardTitle: `She Said Yes`,
      };
    }

    // 1.4 Sinh nhật người yêu
    if (occasion === "BIRTHDAY_LOVER") {
      return {
        dateLabel: "Ngày sinh nhật người thương",
        defaultTitle: "Chúc mừng sinh nhật tình yêu của anh/em 🎂",
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

    // 1.5 Valentine
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

    // 1.6 Ngày 8/3 & 20/10
    if (occasion === "WOMENS_DAY") {
      const isEm = pronoun === "SHE_TO_HE";
      return {
        dateLabel: "Ngày hai ta yêu nhau",
        defaultTitle: isEm
          ? "Dành tặng người phụ nữ tuyệt vời nhất 🌷"
          : "Chúc công chúa của anh ngày 8/3 - 20/10 rực rỡ 🌷",
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

    // 1.7 Ngày 19/11 Nam giới
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

    // 1.8 Giáng sinh & Năm mới
    if (occasion === "CHRISTMAS_COUPLE") {
      return {
        dateLabel: "Ngày hai ta yêu nhau",
        defaultTitle: "Merry Christmas & Happy New Year My Love 🎄",
        storyMessages: [
          "Merry Christmas My Love",
          "Giáng sinh an lành ấm áp",
          "Mùa đông không còn lạnh",
          "Có em bên đời",
          "Món quà Noel tuyệt nhất",
          "Cùng đón năm mới nhé",
          "Bên nhau mọi mùa đông",
          "Trọn vẹn yêu thương",
          "Nụ cười rạng rỡ",
          "Nắm tay đi qua mùa đông",
          "Hạnh phúc ngập tràn",
          "Mãi mãi yêu em",
        ],
        sampleMessage:
          "Mùa đông năm nay chẳng còn giá lạnh vì đã có hơi ấm của em bên cạnh. Chúc tình yêu của anh một mùa Giáng sinh an lành và một năm mới ngập tràn hạnh phúc!",
        anniversarySubtitleFormat: (days) => `${days} ngày ấm áp bên nhau`,
        endingCardTitle: `Merry Christmas & Happy New Year`,
      };
    }

    // 1.9 Chuyến đi cùng nhau
    if (occasion === "TRAVEL_MEMORY") {
      return {
        dateLabel: "Ngày bắt đầu chuyến đi",
        defaultTitle: "Kỷ niệm những chuyến đi và khung trời bên nhau ✈️",
        storyMessages: [
          "Cùng nhau đi khắp thế gian",
          "Từng bước chân kỷ niệm",
          "Bầu trời có em",
          "Khung cảnh tuyệt vời nhất",
          "Nắm tay em đi muôn nơi",
          "Chuyến đi của thanh xuân",
          "Lưu giữ từng khoảnh khắc",
          "Cảnh đẹp lòng bình yên",
          "Hành trình không bao giờ quên",
          "Thêm một miền đất mới",
          "Bên em là hạnh phúc",
        ],
        sampleMessage:
          "Dù đi đến bất cứ đâu, chỉ cần có em bên cạnh thì nơi đó đều trở thành thiên đường. Cảm ơn em đã cùng anh đi qua những cung đường đẹp đẽ nhất!",
        anniversarySubtitleFormat: (days) => `${days} ngày vi vu cùng nhau`,
        endingCardTitle: `Travel With You`,
      };
    }

    // 1.10 Làm lành / Xin lỗi
    if (occasion === "APOLOGY_RECONCILIATION") {
      return {
        dateLabel: "Ngày hai ta yêu nhau",
        defaultTitle: "Anh/Em xin lỗi và thương người ấy nhiều lắm 🕊️",
        storyMessages: [
          "Anh/Em xin lỗi nhé",
          "Đừng giận anh/em nữa mà",
          "Thương em/anh nhiều lắm",
          "Không muốn làm em/anh buồn",
          "Bỏ qua cho anh/em nha",
          "Ôm một cái thật chặt nào",
          "Yêu thương nhiều hơn",
          "Lắng nghe và thấu hiểu",
          "Bình yên trở lại nhé",
          "Mãi mãi yêu người ấy",
          "Cùng nhau sửa đổi nha",
        ],
        sampleMessage:
          "Anh/Em biết mình đã có lúc vô tâm làm người thương phải buồn lòng. Anh/Em thật lòng xin lỗi và mong chúng mình sẽ cùng nhau ngồi lại, lắng nghe và yêu thương nhau nhiều hơn!",
        anniversarySubtitleFormat: (days) => `${days} ngày gắn kết vượt qua`,
        endingCardTitle: `I'm Sorry & Love You`,
      };
    }

    // 1.11 Ngày thường bất ngờ (Just because)
    if (occasion === "JUST_BECAUSE") {
      return {
        dateLabel: "Ngày hai ta yêu nhau",
        defaultTitle: "Bất ngờ dành cho người đặc biệt nhất trong tim ✨",
        storyMessages: [
          "Không vì dịp gì cả",
          "Chỉ vì anh yêu em",
          "Mỗi ngày đều yêu em",
          "Nụ cười của em",
          "Hôm nay thật vui nhé",
          "Nghỉ ngơi chút đi nào",
          "Luôn có anh ở đây",
          "Thương em nhiều lắm",
          "Món quà bất ngờ",
          "Dành trọn yêu thương",
          "Bình yên bên nhau",
          "Có em là đủ",
        ],
        sampleMessage:
          "Không cần phải đợi đến một ngày lễ đặc biệt nào cả, bởi vì với anh, ngày nào có em cũng đều là ngày đáng để yêu thương và nâng niu. Hôm nay thật vui vẻ nhé em!",
        anniversarySubtitleFormat: (days) => `${days} ngày yêu không ngừng nghỉ`,
        endingCardTitle: `Just Because I Love You`,
      };
    }

    // Mặc định: Kỷ niệm ngày yêu nhau (LOVE_ANNIVERSARY)
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

  // =========================================================================
  // 2. CRUSH (Tỏ tình / Thầm thương)
  // =========================================================================
  if (relationship === "CRUSH") {
    if (occasion === "CRUSH_BIRTHDAY") {
      return {
        dateLabel: "Ngày sinh nhật Crush",
        defaultTitle: "Chúc mừng sinh nhật người đặc biệt trong lòng mình 🎂",
        storyMessages: [
          "Happy Birthday to You",
          "Tuổi mới thật rực rỡ",
          "Luôn mỉm cười nhé",
          "Xinh đẹp mỗi ngày",
          "Vạn điều may mắn",
          "Thành công trong mọi việc",
          "Có một người luôn dõi theo",
          "Thầm thương trộm nhớ",
          "Bình yên và hạnh phúc",
          "Sinh nhật thật ý nghĩa",
        ],
        sampleMessage:
          "Chúc bạn một ngày sinh nhật thật ấm áp và ngập tràn niềm vui. Mong mọi ước mơ của bạn sớm thành hiện thực và nụ cười luôn rạng rỡ trên môi!",
        anniversarySubtitleFormat: () => `Chúc mừng sinh nhật tuổi mới rạng ngời`,
        endingCardTitle: `Happy Birthday Crush`,
      };
    }

    return {
      dateLabel: "Ngày đầu tiên gặp gỡ / biết nhau",
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

  // =========================================================================
  // 3. FRIENDSHIP (Bạn bè / Bạn thân)
  // =========================================================================
  if (relationship === "FRIENDSHIP") {
    if (occasion === "FRIEND_BIRTHDAY") {
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

    if (occasion === "GRADUATION") {
      return {
        dateLabel: "Ngày lễ tốt nghiệp",
        defaultTitle: "Chúc mừng tốt nghiệp - Tương lai rực rỡ nhé bạn tôi 🎓",
        storyMessages: [
          "Happy Graduation!",
          "Chúc mừng tốt nghiệp",
          "Thanh xuân rực rỡ",
          "Tự hào về mày lắm",
          "Vững bước tương lai",
          "Bay cao bay xa nhé",
          "Kỷ niệm thời đi học",
          "Mãi là bạn tốt",
          "Thành công phía trước",
          "Chặng đường mới đón chờ",
        ],
        sampleMessage:
          "Chúc mừng chúng ta đã cùng nhau vượt qua những năm tháng học tập đáng nhớ. Chúc mày bước vào chặng đường mới luôn bản lĩnh, tự tin và thành công vang dội!",
        anniversarySubtitleFormat: () => `Thanh xuân rực rỡ cùng nhau`,
        endingCardTitle: `Happy Graduation`,
      };
    }

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

  // =========================================================================
  // 4. FAMILY (Gia đình / Cha mẹ)
  // =========================================================================
  if (relationship === "FAMILY") {
    if (occasion === "MOTHERS_DAY") {
      return {
        dateLabel: "Ngày của Mẹ",
        defaultTitle: "Con yêu Mẹ - Người phụ nữ vĩ đại nhất đời con 🌸",
        storyMessages: [
          "Con yêu Mẹ nhiều lắm",
          "Mẹ luôn mạnh khỏe nhé",
          "Cảm ơn đức hy sinh của Mẹ",
          "Bình an mỗi ngày",
          "Mẹ là tất cả của con",
          "Nụ cười của Mẹ",
          "Mãi yêu Mẹ",
          "Luôn tự hào về Mẹ",
          "Hạnh phúc bên con cháu",
          "Chúc Mẹ vạn sự an lành",
        ],
        sampleMessage:
          "Cảm ơn Mẹ đã luôn tảo tần hy sinh, dành trọn vẹn tình yêu thương nuôi dạy con nên người. Con chúc Mẹ luôn dồi dào sức khỏe, an vui và hạnh phúc bên gia đình!",
        anniversarySubtitleFormat: () => `Mẹ là điều tuyệt vời nhất của con`,
        endingCardTitle: `Con yêu Mẹ`,
      };
    }

    if (occasion === "FATHERS_DAY") {
      return {
        dateLabel: "Ngày của Cha",
        defaultTitle: "Kính chúc Bố luôn mạnh khỏe và là điểm tựa vững chãi 👔",
        storyMessages: [
          "Con yêu Bố nhiều lắm",
          "Bố là điểm tựa vững chắc",
          "Chúc Bố luôn mạnh khỏe",
          "Cảm ơn công ơn trời biển",
          "Luôn tự hào về Bố",
          "Bình an và trường thọ",
          "Gia đình là bến đỗ",
          "Con sẽ luôn cố gắng",
          "Tự hào là con của Bố",
        ],
        sampleMessage:
          "Cảm ơn Bố luôn là chỗ dựa vững vàng che chở cho cả gia đình qua bao sóng gió. Con kính chúc Bố luôn mạnh khỏe, sống vui sống khỏe cùng con cháu!",
        anniversarySubtitleFormat: () => `Bố là chỗ dựa vững chắc nhất`,
        endingCardTitle: `Kính yêu Bố`,
      };
    }

    return {
      dateLabel: "Ngày kỷ niệm gia đình",
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

  // =========================================================================
  // 5. COLLEAGUE (Đồng nghiệp / Đối tác)
  // =========================================================================
  return {
    dateLabel: "Ngày bắt đầu hợp tác / làm việc",
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
