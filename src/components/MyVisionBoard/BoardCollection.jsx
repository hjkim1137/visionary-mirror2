import { useState, useEffect } from 'react';
import styles from './BoardCollection.module.scss';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import useDeleteCollection from './DeleteCollection';

const mockAPI = 'http://localhost:9999/collection';

function BoardCollection() {
  const [collection, setCollection] = useState({
    img: [],
    title: [],
    id: [],
  });

  // db에서 컬렉션 정보 불러오기
  useEffect(() => {
    try {
      fetch(mockAPI)
        .then((response) => {
          if (!response.ok) {
            throw new Error('네트워크 응답이 정상적이지 않습니다');
          }
          return response.json();
        })
        .then((items) => {
          const imgUrls = items.map((item) => item.url);
          const imgTitles = items.map((item) => item.title);
          const imgIds = items.map((item) => item.id);
          setCollection({
            img: imgUrls,
            title: imgTitles,
            id: imgIds,
          });
        });
    } catch (err) {
      console.error('비동기 처리 중 오류가 발생했습니다:', err);
    }
  }, []);

  // 컬렉션 상세보기 페이지 넘어가기
  const navigate = useNavigate();
  const handleBtnForBoardDetail = (id) => {
    navigate(`/myvisionboardgrid/${id}`);
    console.log('상세보기클릭', id);
  };

  // useDeleteCollection 커스텀훅 클릭 핸들러
  const handleDeleteButtonClick = useDeleteCollection(
    collection,
    setCollection,
    mockAPI
  );

  //슬라이드 관련
  const [index, setIndex] = useState(0); // 표시되고 있는 슬라이드 인덱스
  const [isSlide, setIsSlide] = useState(false); // 슬라이드 중 여부 체크, 여러번 빠르게 클릭 못하게 하는 역할
  const [x, setX] = useState(0); // 슬라이드 애니메이션 효과를 주기위한 x만큼 이동

  // 자동으로 슬라이드 넘기기 기능
  useEffect(() => {
    let autoSlide;

    if (index < collection.img.length - 1) {
      // 마지막 슬라이드가 아닐 때만 작동
      autoSlide = setTimeout(() => {
        increaseClick();
      }, 2500); //
    }
    // Component가 unmount 되거나 업데이트 되기 전에 타이머를 정리
    return () => {
      clearTimeout(autoSlide);
    };
  }, [index, collection.img.length]); // 의존성 배열에 index, collectionImg.length 추가

  // 오른쪽 버튼 함수-일방향
  const increaseClick = async () => {
    if (isSlide || index === collection.length - 1) {
      // 마지막 슬라이드일 경우 이동을 멈춤
      return;
    }
    setX(-56);
    setIsSlide(true);

    await setTimeout(() => {
      setIndex((prev) => prev + 1);
      setX(0);
      setIsSlide(false);
    }, 500);
  };

  //왼쪽 버튼 함수- 일방향
  const decreaseClick = async () => {
    if (isSlide || index === 0) {
      // 첫 슬라이드일 경우 이동을 멈춤
      return;
    }
    setX(+56);
    setIsSlide(true);

    await setTimeout(() => {
      setIndex((prev) => prev - 1);
      setX(0);
      setIsSlide(false);
    }, 500);
  };

  // 캐러셀 원형논리 적용 + 이미지가 8개보다 적을 경우 이미지 인덱스가 실제 이미지 수를 넘어가지 않게 함
  const morePrevImg =
    (index + collection.img.length - 2) % collection.img.length; //두 슬라이드 전
  const PrevImg = (index + collection.img.length - 1) % collection.img.length; // 이전 슬라이드
  const NextImg = (index + 1) % collection.img.length; // 다음 슬라이드
  const moreNextImg = (index + 2) % collection.img.length; //두 슬라이드 뒤

  // 리턴
  return (
    <div className={styles.wrapper}>
      {/* 보유한 컬렉션 없으면 문구 제외 모든 기능 숨김 */}
      {collection.img.length === 0 ? (
        <div className={styles.noCollection}>
          보유한 컬렉션이 없습니다. 비전보드를 만들어보세요!
        </div>
      ) : (
        <>
          {/* 왼쪽 버튼 */}
          <button
            className={styles.leftButton}
            onClick={decreaseClick}
            // 첫번째 페이지 도달 시 버튼 숨김
            style={{ display: index === 0 ? 'none' : 'block' }}
          >
            <FiChevronLeft />
          </button>

          {/* 오른쪽 버튼 */}
          <button
            className={styles.rightButton}
            onClick={increaseClick}
            // 마지막 페이지 도달 시 버튼 숨김
            style={{
              display: index === collection.img.length - 1 ? 'none' : 'block',
            }}
          >
            <FiChevronRight />
          </button>

          {/* 가로 정렬 등 전체 스타일 시작  */}
          <div
            className={styles.row}
            key={index}
            // ref={slideRef}
            style={{
              transform: `translateX(${x}vw)`,
            }}
          >
            {/* 전전 슬라이드에 적용 */}
            <div className={styles.container}>
              <img
                className={styles.priviewImg}
                src={collection.img[morePrevImg]}
              ></img>
            </div>

            {/* 전 슬라이드에 적용 */}
            <div className={styles.container}>
              <img
                className={styles.priviewImg}
                src={collection.img[PrevImg]}
              ></img>
            </div>

            {/* 현재 슬라이드 시작 */}
            <div className={styles.imgWrapper}>
              <img className={styles.img} src={collection.img[index]}></img>

              {/* 이미지 설명 박스 */}
              <div className={styles.imgDes}>
                <div className={styles.title}>{collection.title[index]}</div>
              </div>
            </div>
            {/* 현재 슬라이드  끝 */}

            {/* 다음 슬라이드에 적용 */}
            <div className={styles.container}>
              <img
                className={styles.priviewImg}
                src={collection.img[NextImg]}
              ></img>
            </div>

            {/* 다다음 슬라이드에 적용 */}
            <div className={styles.container}>
              <img
                className={styles.priviewImg}
                src={collection.img[moreNextImg]}
              ></img>
            </div>
          </div>

          {/* 가로 정렬 등 전체 스타일 끝  */}

          {/* 현재 슬라이드 위치 표시 */}
          <div className={styles.dotWrapper}>
            {collection.img.map((_, idx) => (
              <div
                key={idx}
                className={
                  styles.dot + (idx === index ? ' ' + styles.active : '')
                }
              ></div>
            ))}
          </div>

          {/* 버튼박스 */}
          <div className={styles.buttonBox}>
            <button
              className={styles.deleteButton}
              onClick={() => handleDeleteButtonClick(index)}
            >
              컬렉션 삭제
            </button>

            <button
              className={styles.detailButton}
              onClick={() => handleBtnForBoardDetail(collection.id[index])}
            >
              컬렉션 상세보기
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default BoardCollection;
