/** 쓰기·소각·재 상태머신 — 소각 시 글을 태우고 '재' 화면을 보인다. */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopWarningBanner from '../components/layout/TopWarningBanner';
import PaperEditor from '../components/paper/PaperEditor';
import RoundButton from '../components/common/RoundButton';
import BurnAway from '../components/fire/BurnAway';
import { incrementBurnCount, getTodayBurnCount } from '../utils/burnCount';
import { createPost } from '../apis/posts';
import { getNickname } from '../utils/nickname';
import './PaperPage.css';

export default function PaperPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('writing'); // writing | burning | ashed
  const [content, setContent] = useState('');
  const [burnedCount, setBurnedCount] = useState(0);

  const incinerate = async () => {
    if (!content) return; // 빈 글은 보내지 않는다(백엔드가 1자 이상 요구 — CommentInput과 동일한 최소 가드)
    // 공유(소각) — 글을 피드에 저장한 뒤 타는 애니메이션으로 넘어간다.
    await createPost({ nickname: getNickname(), content });
    setPhase('burning');
  };
  const onBurnt = () => {
    setBurnedCount(incrementBurnCount());
    setPhase('ashed');
  };

  if (phase === 'ashed') {
    return (
      <div className='paper-page paper-page--ashed'>
        <TopWarningBanner />
        <h1 className='ashed__title'>
          당신의 이야기는
          <br />
          재가 되어 사라졌습니다
        </h1>
        <p className='ashed__count'>
          오늘 {burnedCount || getTodayBurnCount()}명이 소각했습니다
        </p>
        <div className='ashed__buttons'>
          <RoundButton
            label='더 쓰기'
            variant='metal'
            onClick={() => {
              setContent('');
              setPhase('writing');
            }}
          />
          <RoundButton
            label='피드 보기'
            variant='metal'
            onClick={() => navigate('/feed')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className='paper-page'>
      <TopWarningBanner />
      <h2 className='paper-page__prompt'>
        태워 버리고 싶은 당신의 속마음을 말해보세요.
      </h2>
      <BurnAway
        trigger={phase === 'burning'}
        onComplete={onBurnt}
      >
        <PaperEditor
          value={content}
          onChange={setContent}
        />
      </BurnAway>
      <div className='paper-page__buttons'>
        <RoundButton
          label='소각'
          variant='red'
          onClick={incinerate}
        />
        <RoundButton
          label='피드'
          variant='blue'
          onClick={() => navigate('/feed')}
        />
      </div>
    </div>
  );
}
